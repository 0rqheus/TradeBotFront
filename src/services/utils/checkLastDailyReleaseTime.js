export default function checkLastDailyReleaseTime(solvedTime, chalengeName) {
    const now = Date.now();
    const nowDate = getDateByMillisec(now);

    return solvedTime > getLastDailyReleaseTime(nowDate);
}

function getLastDailyReleaseTime() {
    const now = moment().utc();
    const currHour = now.hour();
  
    const lastDailySbcRefresh = moment()
      .utc()
      .set({ hours: 18, minutes: 0, seconds: 0 });
  
    if (currHour < 18) {
      lastDailySbcRefresh.subtract(1, 'days');
    }
  
    return lastDailySbcRefresh.unix() * 1000;
  }