import {
  createClient, Client, accounts_set_input, proxies_insert_input,
  accounts_insert_input,
  scheduler_account_info_set_input,
  accounts_updates
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
export type ProxyData = Awaited<ReturnType<ApiService['getProxiesByHosts']>>[number];
export type HistoryItem = Awaited<ReturnType<ApiService['getHistoryItemsByTime']>>[number];


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
        // gauth: true,
        should_run: true,
        platform: true,
        // password: true,
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

  @tryCatch([])
  async getAccountsByEmails(emails: string[]) {
    const result = await this.client.query({
      accounts: {
        __args: {
          where: {
            email: { _in: emails }
          }
        },
        id: true,
        email: true,
        proxy_id: true,
        general_account_id: true,
      },
    });
    return result.accounts;
  };

  @tryCatch([])
  async getProxiesByHosts(hosts: string[]) {
    const result = await this.client.query({
      proxies: {
        __args: {
          where: {
            host: { _in: hosts }
          }
        },
        id: true,
        host: true,
        port: true
      },
    });
    return result.proxies;
  };

  @tryCatch([])
  async getProxyIdsByHostPort(host: string, port: string) {
    const result = await this.client.query({
      proxies: {
        __args: {
          where: {
            host: { _eq: host },
            port: { _eq: port }
          }
        },
        id: true,
      }
    });
    return result.proxies;
  };

  @tryCatch(0)
  async createAccounts(objects: accounts_insert_input[]) {
    if (objects.length === 0) {
      return 0;
    }
    const result = await this.client.mutation({
      insert_accounts: {
        __args: {
          objects
        },
        affected_rows: true,
      }
    });
    return result.insert_accounts;
  }


  @tryCatch(0)
  async udpateConfig(objects: accounts_insert_input[]) {
    if (objects.length === 0) {
      return 0;
    }
    const result = await this.client.mutation({
      insert_accounts: {
        __args: {
          objects
        },
        affected_rows: true,
      }
    });
    return result.insert_accounts;
  }

  // async updateAccount(account: any) {
  //   delete account.__typename;
  //   delete account.proxy;
  //   delete account.requests;
  //   delete account.minutes_active;
  //   delete account.available_balance;
  //   delete account.freezed_balance;
  //   delete account.scheduler_account_info;
  //   delete account.ban_analytics_info;
  //   delete account.general_account;
  //   delete account.service_name;
  //   delete account.objectives_progress;
  //   delete account.proxy;
  //   delete account.accounts_workshift;
  //   delete account.accounts_challenges;

  //   const result = await this.client.mutation({
  //     mutation: UPDATE_ACCOUNT,
  //     variables: {
  //       id: account.id,
  //       _set: account,
  //     },
  //   });
  // }

  // @tryCatch(0)
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

  // @tryCatch(0)
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

  @tryCatch(null)
  async updateAccount(id: number, data: Account) {
    console.log('updateAccount', id, data);
    const result = await this.client.mutation({
      update_accounts_by_pk: {
        __args: {
          pk_columns: {
            id
          },
          _set: {
            activity_status: data.activity_status,
            should_run: data.should_run,
            strategy_name: data.strategy_name,
            group: data.group,
            origin: data.origin,
            proxy_id: data.proxy_id,
            account_owner: data.account_owner,
            workshift_id: data.workshift_id,
          }
        },
        id: true
      }
    });
    return result.update_accounts_by_pk?.id
  }

  @tryCatch([])
  async updateAccountsBatch(updates: accounts_updates[]) {
    if (updates.length === 0) {
      return 0;
    }
    const result = await this.client.mutation({
      update_accounts_many: {
        __args: {
          updates
        },
        affected_rows: true
      }
    });
    return result.update_accounts_many
  }

  @tryCatch(0)
  async updateAccountBansConfig(accounts: { id: number }[], newConfigId: number) {
    const result = await this.client.mutation({
      update_ban_analytics_info: {
        __args: {
          where: {
            account_id: { _in: accounts.map(acc => acc.id) }
          },
          _set: {
            ban_analytics_config_id: newConfigId
          }
        },
        affected_rows: true
      }
    });
    return result.update_ban_analytics_info?.affected_rows ?? 0
  }

  // @tryCatch(0)
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

  // @tryCatch(0)
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

  @tryCatch([])
  async getHistoryItems(accountIds: number[]) {
    const result = await this.client.query({
      history_items: {
        __args: {
          where: {
            account_id: { _in: accountIds },
          },
        },
        id: true,
        account_id: true,
        actual_end: true,
        actual_start: true,
        captcha_failed_count: true,
        captcha_solved_count: true,
        minutes_active: true,
        minutes_paused: true,
        requests_made: true,
        scheduled_end: true,
        scheduled_start: true,
        strategy_name: true,
        sbc_submits: true,
      }
    });
    return result.history_items;
  }

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

  @tryCatch([])
  async getSchedulerInfo(accountIds: number[]) {
    const result = await this.client.query({
      scheduler_account_info: {
        __args: {
          where: {
            account_id: { _in: accountIds },
          },
        },
      },
      id: true,
      account_id: true,
      config_id: true,
    });
    return result.scheduler_account_info;
  }

  @tryCatch([])
  async getHistoryItemsByTime(from: Date, to: Date) {
    const result = await this.client.query({
      history_items: {
        __args: {
          where: {
            _or: [
              {
                scheduled_end: { _is_null: false, _gt: from.toISOString() },
                scheduled_start: { _is_null: false, _lt: to.toISOString() }
              },
              {
                account: { activity_status: { _in: ['ON', 'PAUSED'] } },
                scheduled_start: { _gt: from.toISOString() }
              }
            ]
          }
        },
        account_id: true,
        actual_end: true,
        actual_start: true,
        scheduled_end: true,
        scheduled_start: true,
        requests_made: true,
        minutes_active: true,
        strategy_name: true,
        sbc_submits: true,
      },
    });

    return result.history_items;
  }

  @tryCatch(null)
  async createNewProxy(object: proxies_insert_input) {
    const result = await this.client.mutation({
      insert_proxies_one: {
        __args: {
          object
        },
        id: true
      }
    });
    return result.insert_proxies_one?.id;
  }

  @tryCatch(null)
  async createGeneralAccount(email: string) {
    const result = await this.client.mutation({
      insert_general_accounts_one: {
        __args: {
          object: {
            email: email
          }
        },
        id: true
      },
    });
    return result.insert_general_accounts_one;
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
