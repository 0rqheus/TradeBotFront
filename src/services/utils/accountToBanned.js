export default function accountToBanned(account) {
  const newBannedAccount = {
    id: account.id,
    email: account.email,
    gauth: account.gauth,
    password: account.password,
    should_run: account.should_run,
    activity_status: account.activity_status,
    balance: account.balance,
    free_money: account.free_money,
    transfer_list_count: account.transfer_list_count,
    has_urgent_task: account.has_urgent_task,
    platform: account.platform,
    proxy: account.proxy.host + ':' + account.proxy.port,
  };
  return newBannedAccount;
}
