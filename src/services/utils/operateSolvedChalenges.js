import checkLastSolvedTime from './checkLastSolvedTime';

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

  solvedChallenges.forEach((challenge) => {
    if (
      challenge.sbc_name == 'Daily Tradeable Winter Challenge' &&
      checkLastSolvedTime(challenge.solved_at, challenge.sbc_name)
    ) {
      solvedDailyArray.push(challenge.challenge_index);
    }
  });

  let marqueeArray = arrayUnique(solvedDailyArray);
  if(marqueeArray.length == 1) {
    solvedDaily += 'D';
  }

  return solvedDaily;
}

function arrayUnique(array) {
  let arraySet = new Set(array);
  return Array.from(arraySet);
}
