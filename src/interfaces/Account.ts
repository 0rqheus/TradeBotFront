export interface Account {
  id: number,
  email: string,
  activity_status: number,
  freezed_balance: number,
  available_balance: number,
  should_run: boolean,
  strategy_name: string,
  group: string,
  origin: string,
  proxy_id: number,
  account_owner: string,
  proxy: {
    host: string,
    port: string,
  },
  scheduler_account_info: {
    block_reason: string,
    blocked_at: number,
    service_name: string,
    config_id: number
  },
  ban_analytics_info: {
    ban_analytics_config_id: number,
  },
  general_account_id: number,
  general_account: {
    account_challenges_infos: { challenge_id: string }[],
    accounts_inventories_aggregate: { aggregate: { count: number } },
    is_web_tm_opened: string
  },
  history: {
    account_id: number,
    minutes_active: number,
    requests_made: number,
    sbc_submits: number
  }
  workshift_id: number,
  
  sbcRewardsSum: number,
  sbcTradeExpensesSum: number,
  sbcUntradeExpensesSum: number,
}