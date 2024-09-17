export const sleep = (delay) => new Promise(r => setTimeout(r, delay));

export const balanceStringToNumber = (balanceString) => Number(balanceString.replaceAll(',', ''));

export const formatNumber = (number) => number.toLocaleString('en')

export const getLastTimeForRequests = () => {
  const lastStartRequestsRefresh = moment()
    .utc()
    .set({ hours: 9, minutes: 0, seconds: 0 });

  return lastStartRequestsRefresh.unix() * 1000;
}