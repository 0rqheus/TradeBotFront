import moment from 'moment';

export function checkLastSolvedTime(solvedTime, chalengeName) {
  const now = Date.now();
  const nowDate = getDateByMillisec(now);

  if(chalengeName.toLowerCase().includes('uefa')) {
    return solvedTime > getLastUefaMarqueeReleaseDate(nowDate);
  }

  return solvedTime > getLastMarqueeReleaseDate(nowDate);
}

function getLastMarqueeReleaseDate(nowDate) {
  const lastMarqueeMatchupsUpdateDate = moment()
    .startOf('week')
    .day(5)
    .utc()
    .set({ hours: 18, minutes: 0, seconds: 0 });

  if (
    (nowDate.dayOfWeek >= 0 && nowDate.dayOfWeek < 4) ||
    (nowDate.dayOfWeek == 4 && nowDate.hourOfDay < 18)
  ) {
    lastMarqueeMatchupsUpdateDate.subtract(7, 'days');
  }

  return lastMarqueeMatchupsUpdateDate.unix() * 1000;
}

function getLastUefaMarqueeReleaseDate(nowDate) {
  const lastMarqueeMatchupsUpdateDate = moment()
    .startOf('week')
    .day(2)
    .utc()
    .set({ hours: 18, minutes: 0, seconds: 0 });

  if (
    (nowDate.dayOfWeek >= 0 && nowDate.dayOfWeek < 2) ||
    (nowDate.dayOfWeek == 2 && nowDate.hourOfDay < 18)
  ) {
    lastMarqueeMatchupsUpdateDate.subtract(7, 'days');
  }

  return lastMarqueeMatchupsUpdateDate.unix() * 1000;
}

export function getDateByMillisec(millisec) {
  const solvedDate = new Date(millisec);

  const dayOfMonth = solvedDate.getUTCDate();
  const dayOfWeek = solvedDate.getUTCDay();
  const hourOfDay = solvedDate.getUTCHours();

  return {
    dayOfWeek,
    dayOfMonth,
    hourOfDay,
  };
}
