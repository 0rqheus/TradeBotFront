import checkLastSolvedTime from './checkLastSolvedTime';

export default function operateSolvedChallenges(solvedChallenges) {
  let solved = '';
  solved += operateFoundations(solvedChallenges);
  solved += operateMarquee(solvedChallenges);

  return solved;
}

function operateFoundations(solvedChallenges) {
  let solvedFoundations = '';
  let foundationsArray = arrayUnique(
    solvedChallenges
      .filter((challenge) => challenge.sbc_name == 'Foundations I')
      .map((challenge) => challenge.challenge_index)
  );

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
      checkLastSolvedTime(challenge.solved_at)
    ) {
      solvedMarqueeArray.push(challenge.challenge_index);
    }
  });

  let marqueeArray = arrayUnique(solvedMarqueeArray);
  if (marqueeArray.length == 4) {
    solvedMarquee += 'M0';
  } else {
    marqueeArray.forEach((challenge) => {
      solvedMarquee += 'M' + challenge;
    });
  }

  return solvedMarquee;
}

function arrayUnique(array) {
  let arraySet = new Set(array);
  return Array.from(arraySet);
}
