import moment from 'moment';

export default function getLastTimeForRequests() {
  const lastStartRequestsRefresh = moment()
    .utc()
    .set({ hours: 9, minutes: 0, seconds: 0 });

  return lastStartRequestsRefresh.unix() * 1000;
}
