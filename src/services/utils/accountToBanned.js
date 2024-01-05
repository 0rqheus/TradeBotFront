export function accountToBanned(account) {
  const newBannedAccount = {
    id: account.id,
    email: account.email,
    gauth: account.gauth,
    password: account.password,
    should_run: account.should_run,
    activity_status: account.activity_status,
    available_balance: account.available_balance,
    available_balance: account.available_balance,
    transfer_list_count: account.transfer_list_count,
    has_urgent_task: account.has_urgent_task,
    platform: account.platform,
    strategy_name: account.strategy_name,
    proxy: account.proxy.host + ':' + account.proxy.port,
  };
  return newBannedAccount;
}

export function historyItemToArchive(historyItem) {
  const newHistoryItem = {
    id: historyItem.id,
    account_id: historyItem.account_id,
    scheduled_start: historyItem.scheduled_start,
    actual_start: historyItem.actual_start,
    scheduled_end: historyItem.scheduled_end,
    actual_end: historyItem.actual_end,
    minutes_active: historyItem.minutes_active,
    minutes_paused: historyItem.minutes_paused,
    requests_made: historyItem.requests_made,
    captcha_solved_count: historyItem.captcha_solved_count,
    captcha_failed_count: historyItem.captcha_failed_count,
    strategy_name: historyItem.strategy_name,
  };
  return newHistoryItem;
}

export function schedulerInfoToArchive(schedulerInfo) {
  const newSchedulerInfo = {
    id: schedulerInfo.id,
    account_id: schedulerInfo.account_id,
    config_id: schedulerInfo.config_id
  }

  return newSchedulerInfo;
}
