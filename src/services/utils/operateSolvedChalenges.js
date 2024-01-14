import { checkLastSolvedTime } from './checkLastSolvedTime';
import checkLastDailyReleaseTime from './checkLastDailyReleaseTime'

export default function operateSolvedChallenges(solvedChallenges) {
  let solved = '';
  solved += operateFoundations(solvedChallenges);
  solved += operateMarquee(solvedChallenges);
  solved += operateUefa(solvedChallenges)
  solved += operateWomenUefa(solvedChallenges)
  solved += operateDaily(solvedChallenges)

  return solved;
}

function operateFoundations(solvedChallenges) {
  let solvedFoundations = '';
  let foundationsArray = arrayUnique(
    solvedChallenges
      .filter((challenge) => challenge.sbc_name == 'Foundations I')
      .map((challenge) => challenge.challenge_index)
  );

  foundationsArray.sort((a, b) => a - b)
  if (foundationsArray.length == 4) {
    solvedFoundations += 'F0';
  } else {
    foundationsArray.forEach((challenge) => {
      solvedFoundations += 'F' + challenge;
    });
  }

  return solvedFoundations;
}

function operateMarquee(solvedChallenges) {
  let solvedMarquee = '';
  const solvedMarqueeArray = [];

  solvedChallenges.forEach((challenge) => {
    if (
      challenge.sbc_name == 'Marquee Matchups' &&
      checkLastSolvedTime(challenge.solved_at, challenge.sbc_name)
    ) {
      solvedMarqueeArray.push(challenge.challenge_index);
    }
  });

  let marqueeArray = arrayUnique(solvedMarqueeArray);
  marqueeArray.sort((a, b) => a - b)
  if (marqueeArray.length == 4) {
    solvedMarquee += 'M0';
  } else {
    marqueeArray.forEach((challenge) => {
      solvedMarquee += 'M' + challenge;
    });
  }  

  return solvedMarquee;
}

function operateUefa(solvedChallenges) {
  let solvedUefaMarquee = '';
  const solvedUefaMarqueeArray = [];

  solvedChallenges.forEach((challenge) => {
    if (
      challenge.sbc_name == 'UEFA Marquee Matchups' &&
      checkLastSolvedTime(challenge.solved_at, challenge.sbc_name)
    ) {
      solvedUefaMarqueeArray.push(challenge.challenge_index);
    }
  });

  let marqueeArray = arrayUnique(solvedUefaMarqueeArray);
  marqueeArray.sort((a, b) => a - b)
  if (marqueeArray.length == 2) {
    solvedUefaMarquee += 'U0';
  } else {
    marqueeArray.forEach((challenge) => {
      solvedUefaMarquee += 'U' + challenge;
    });
  }  

  return solvedUefaMarquee;
}

function operateWomenUefa(solvedChallenges) {
  let solvedUefaMarquee = '';
  const solvedUefaMarqueeArray = [];

  solvedChallenges.forEach((challenge) => {
    if (
      challenge.sbc_name == "UEFA Women's Marquee Matchups" &&
      checkLastSolvedTime(challenge.solved_at, challenge.sbc_name)
    ) {
      solvedUefaMarqueeArray.push(challenge.challenge_index);
    }
  });

  let marqueeArray = arrayUnique(solvedUefaMarqueeArray);
  marqueeArray.sort((a, b) => a - b)
  if (marqueeArray.length == 2) {
    solvedUefaMarquee += 'W0';
  } else {
    marqueeArray.forEach((challenge) => {
      solvedUefaMarquee += 'W' + challenge;
    });
  }  

  return solvedUefaMarquee;
}

function operateDaily(solvedChallenges) {
  let solvedDaily = '';
  const solvedDailyArray = [];
  const solvedDailyBronzeArray = [];
  const solvedDailySilverArray = [];
  const solvedDailyGoldArray = [];

  solvedChallenges.forEach((challenge) => {
    if (
      challenge.sbc_name == 'Daily Tradeable Winter Challenge' &&
      checkLastDailyReleaseTime(challenge.solved_at, challenge.sbc_name)
    ) {
      solvedDailyArray.push(challenge.challenge_index);
    }
  });

  solvedChallenges.forEach((challenge) => {
    if (
      challenge.sbc_name == 'Daily Bronze Upgrade' &&
      checkLastDailyReleaseTime(challenge.solved_at, challenge.sbc_name)
    ) {
      solvedDailyBronzeArray.push(challenge.challenge_index);
    }
  });

  solvedChallenges.forEach((challenge) => {
    if (
      challenge.sbc_name == 'Daily Silver Upgrade' &&
      checkLastDailyReleaseTime(challenge.solved_at, challenge.sbc_name)
    ) {
      solvedDailySilverArray.push(challenge.challenge_index);
    }
  });

  solvedChallenges.forEach((challenge) => {
    if (
      challenge.sbc_name == 'Daily Gold Upgrade' &&
      checkLastDailyReleaseTime(challenge.solved_at, challenge.sbc_name)
    ) {
      solvedDailyGoldArray.push(challenge.challenge_index);
    }
  });

  let marqueeArray = arrayUnique(solvedDailyArray);
  let bronzeArray = arrayUnique(solvedDailyBronzeArray);
  let silverArray = arrayUnique(solvedDailySilverArray);
  let goldArray = arrayUnique(solvedDailyGoldArray);
  if(marqueeArray.length == 1) {
    solvedDaily += 'D';
  }
  if(bronzeArray.length == 1) {
    solvedDaily += 'B';
  }
  if(silverArray.length == 1) {
    solvedDaily += 'S';
  }

  if (goldArray.length == 2) {
    solvedDaily += 'G0';
  } else {
    goldArray.forEach((challenge) => {
      solvedDaily += 'G' + challenge;
    });
  }  

  return solvedDaily;
}

function arrayUnique(array) {
  let arraySet = new Set(array);
  return Array.from(arraySet);
}
