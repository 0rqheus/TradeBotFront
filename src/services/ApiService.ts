import moment from 'moment'
import {
  createClient, Client, accounts_set_input,
  scheduler_account_info_set_input,
} from '../generated/trade'

export interface AccountImportInput {
  accountOwner: string
  origin: string
  email: string
  password: string
  gauth: string
  proxyIp: string
  proxyPort: string
  proxyLogin: string
  proxyPass: string
}

export type Account = Awaited<ReturnType<ApiService['getFullAccounts']>>[number];
export type AggregatedHistory = Awaited<ReturnType<ApiService['getAllAggregatedHistory']>>[number];
export type SbcInfo = Awaited<ReturnType<ApiService['getCurrentSbcs']>>[number];


// eslint-disable-next-line @typescript-eslint/no-unused-vars
function tryCatch(errorReturnValue: any) {
  return function (target: Object, methodName: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    // eslint-disable-next-line func-names
    descriptor.value = async function (...args: any[]) {
      try {
        const result = await originalMethod.apply(this, args);
        return result;
      } catch (err) {
        console.error(`DB ERROR ${methodName}`, err);
        return errorReturnValue;
      }
    };

    return descriptor;
  };
}

export class ApiService {
  constructor(private client: Client) { }

  private readonly challengeIdsToIgnore = [
    // foundations
    38, 39, 40, 41,
    // kickstart
    8, 9, 12, 23, 22, 21, 20, 13, 14, 15, 19
  ];

  @tryCatch([])
  async getFullAccounts() {
    const result = await this.client.query({
      accounts: {
        id: true,
        email: true,
        activity_status: true,
        freezed_balance: true,
        available_balance: true,
        should_run: true,
        platform: true,
        strategy_name: true,
        group: true,
        origin: true,
        proxy_id: true,
        account_owner: true,
        proxy: {
          host: true,
          port: true,
        },
        scheduler_account_info: {
          block_reason: true,
          blocked_at: true,
          service_name: true,
          config_id: true
        },
        ban_analytics_info: {
          ban_analytics_config_id: true,
        },
        general_account_id: true,
        general_account: {
          account_challenges_infos: {
            __args: {
              where: {
                challenge_id: {
                  _nin: this.challengeIdsToIgnore
                },
                is_solved: { _eq: true }
              }
            },
            challenge_id: true
          },
          is_web_tm_opened: true
        },
        workshift_id: true,
      },
    });
    return result.accounts;
  };

  @tryCatch(null)
  async getAllAggregatedHistory(intervalInMs: number) {
    const startTime = moment().utc().subtract(intervalInMs, 'ms').format();

    const res = await this.client.query({
      all_history_items_aggregated: {
        __args: {
          args: {
            start_time: startTime
          }
        },
        account_id: true,
        captcha_failed_count: true,
        captcha_solved_count: true,
        logins_count: true,
        minutes_active: true,
        minutes_paused: true,
        requests_made: true,
        sbc_submits: true
      },
    });

    return res.all_history_items_aggregated;
  }

  @tryCatch([])
  async getCurrentSbcs() {
    const result = await this.client.query({
      current_sbc: {
        __args: {
          where: {
            id: {
              _eq: 318
            }
          }
        },
        id: true,
        name: true,
        pack_name: true,
        tradeable: true,
        repeat_count: true,
        refresh_interval: true,
        current_challenges: {
          challenge_index: true,
          tradeable: true,
          pack_name: true,
          account_challenges_infos_aggregate: {
            aggregate: {
              count: true,
              avg: {
                total_buy_sum: true
              }, 
            }
          }
        }
      }
    });
    return result.current_sbc;
  }


  // admin actions
  
  async deleteAccounts(accounts: { id: number }[]) {
    const result = await this.client.mutation({
      delete_accounts: {
        __args: {
          where: {
            id: { _in: accounts.map(acc => acc.id) }
          }
        },
        affected_rows: true
      }
    });
    return result.delete_accounts?.affected_rows ?? 0
  }

  // accs + config editing
  async updateAccounts(accounts: { id: number }[], data: accounts_set_input) {
    const result = await this.client.mutation({
      update_accounts: {
        __args: {
          where: {
            id: { _in: accounts.map(acc => acc.id) },
          },
          _set: data
        },
        affected_rows: true
      }
    });
    return result.update_accounts?.affected_rows ?? 0
  }

  async updateAccountSchedulerInfo(accounts: { id: number }[], data: scheduler_account_info_set_input) {
    const result = await this.client.mutation({
      update_scheduler_account_info: {
        __args: {
          where: {
            account_id: { _in: accounts.map(acc => acc.id) }
          },
          _set: data
        },
        affected_rows: true
      }
    });
    return result.update_scheduler_account_info?.affected_rows ?? 0
  }

  async updateAccountsBanConfigId(accounts: { id: number }[], configId: number) {
    const result = await this.client.mutation({
      update_ban_analytics_info: {
        __args: {
          where: {
            account_id: { _in: accounts.map(acc => acc.id) }
          },
          _set: {
            ban_analytics_config_id: configId
          }
        },
        affected_rows: true
      }
    });
    return result.update_ban_analytics_info?.affected_rows ?? 0
  }

  // data for config editing
  @tryCatch([])
  async getActiveServices() {
    const result = await this.client.query({
      worker_services: {
        service_name: true
      }
    });
    return result.worker_services;
  }

  @tryCatch([])
  async getSchedulerConfigIds() {
    const result = await this.client.query({
      scheduler_config: {
        id: true
      }
    });
    return result.scheduler_config.map(config => config.id);
  }

  @tryCatch([])
  async getBanAnalyticsConfigIds() {
    const result = await this.client.query({
      ban_alalytics_config: {
        id: true
      }
    });
    return result.ban_alalytics_config.map(config => config.id);
  }
}

const createApiService = (token: string) =>
  new ApiService(createClient({
    url: process.env.REACT_APP_API_URL,
    fetch,
    headers: {
      'Authorization': `Bearer ${token}`
    }
  }));

export default createApiService;
