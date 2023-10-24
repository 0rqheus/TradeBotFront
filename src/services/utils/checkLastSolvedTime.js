import moment from 'moment';

export default function checkLastSolvedTime(solvedTime) {
  const now = Date.now();
  const nowDate = getDateByMillisec(now);

  const lastMarqueeMatchupsUpdateDateToUnix =
    getLastMarqueeReleaseDate(nowDate);

  return solvedTime > lastMarqueeMatchupsUpdateDateToUnix;
}

function getLastMarqueeReleaseDate(nowDate) {
  const lastMarqueeMatchupsUpdateDate = moment()
    .startOf('week')
    .day(5)
    .utc()
    .set({ hours: 18, minutes: 0, seconds: 0 });

  if (
    (nowDate.dayOfWeek > 0 && nowDate.dayOfWeek < 4) ||
    (nowDate.dayOfWeek == 4 && nowDate.hourOfDay < 18)
  ) {
    lastMarqueeMatchupsUpdateDate.subtract(7, 'days');
  }

  return lastMarqueeMatchupsUpdateDate.unix() * 1000;
}

function getDateByMillisec(millisec) {
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
