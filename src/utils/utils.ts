import moment from 'moment';
import { Account, HistoryItem } from '../services/ApiService';

export const sleep = (delay: number) => new Promise(r => setTimeout(r, delay));

export const balanceStringToNumber = (balanceString: string) => Number(balanceString.toString()?.replaceAll(',', ''));

export const formatNumber = (value: number) => value.toLocaleString('en')

export const getLastTimeForRequests = () => {
  const lastStartRequestsRefresh = moment()
    .utc()
    .set({ hours: 9, minutes: 0, seconds: 0 })
    .unix();

  return lastStartRequestsRefresh * 1000;
}

export const getAccountsWithRunStats = (accounts: Account[], historyItems: HistoryItem[]) => {
  const newAccs = accounts.map((acc) => {
    const newAcc = {
      ...acc,
      requests: 0,
      minutes_active: 0,
      sbc_submits: 0,
    }

    historyItems.forEach((item: any) => {
      if (item.account_id === acc.id) {
        newAcc.requests += item.requests_made
        newAcc.minutes_active += item.minutes_active
        newAcc.sbc_submits += item.sbc_submits
      }
    });

    return newAcc;
  });

  return newAccs;
}

export const getAccGroup = (host: string, port: string) => {
  const fittingPort = port.slice(2).replace(/^0+/, '')

  const hostSplitted = host.split('.').slice(0, -1);
  hostSplitted.push(fittingPort);

  return hostSplitted.join('.');
}

export function chunkArray<T>(sourceArray: T[], chunkSize: number): T[][] {
  const resultArray: T[][] = [];
  for (let i = 0; i < sourceArray.length; i += chunkSize) {
    const chunk = sourceArray.slice(i, i + chunkSize);

    resultArray.push(chunk);
  }
  return resultArray;
}
