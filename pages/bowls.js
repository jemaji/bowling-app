import styles from '../styles/Bowls.module.css';
import { useState, useEffect } from 'react';

export default function Bowls() {

  const array10 = Array.from({ length: 10 }, (_, i) => i + 1);

  const getInitialRounds = () => {
    const roundNumbers = array10;
    const throwNumbers = Array.from({ length: 2 }, (_, i) => i + 1);
    return roundNumbers.reduce(
      (roundNumberAcc, roundNumberCurr) => {
        roundNumberAcc[roundNumberCurr] = throwNumbers.reduce(
          (throwNumberAcc, throwNumberCurr) => {
            throwNumberAcc[throwNumberCurr] = new Set();
            return throwNumberAcc;
          }, {}
        );
        return roundNumberAcc;
      }, {}
    );
  };

  const [lastRound, setLastRound] = useState(1);
  const [lastThow, setLastThow] = useState(1);
  const [currentRound, setCurrentRound] = useState(1);
  const [currentThow, setCurrentThow] = useState(1);
  const [rounds, setRounds] = useState(getInitialRounds());
  const [animatedPins, setAnimatedPins] = useState(new Set());
  const [rollingBall, setRollingBall] = useState(false);
  const [footBowling, setFootBowling] = useState(new Set(array10));

  const initialiceProperties = () => {
    setLastRound(1);
    setLastThow(1);
    setCurrentRound(1);
    setCurrentThow(1);
    setRounds(getInitialRounds());
    setAnimatedPins(new Set());
    setRollingBall(false);
    setFootBowling(new Set(array10));
  };

  const reset = () => initialiceProperties();

  const activeAllPins = () => {
    let activatedPins;
    if (currentThow == 1) {
      activatedPins = new Set(array10);
      setAnimatedPins(activatedPins);
    } else {
      activatedPins = new Set();
      array10.forEach((pinNumber) => {
        if (!rounds[currentRound][1].has(pinNumber)) {
          activatedPins.add(pinNumber);
        }
      });
      setAnimatedPins(activatedPins);
    }
    return activatedPins;
  };

  const deactiveAllPins = () => {
    let activatedPins = new Set();
    setAnimatedPins(activatedPins);
    return activatedPins;
  };

  const upAllPins = () => setFootBowling(new Set(array10));

  const next = () => {
    if (currentRound == lastRound && currentThow == lastThow) {
      return nextLastRound();
    }

    // if the throw is a fix go to last round
    return nextFixThrow();
  };

  const nextLastRound = () => {
    if (currentThow == 2 || isStrike(currentRound)) {
      setCurrentRound(currentRound + 1);
      setCurrentThow(1);
      setLastRound(currentRound + 1);
      setLastThow(1);
      upAllPins();
      return;
    }
    setCurrentThow(2);
    setLastThow(2);
  };

  const nextFixThrow = () => {
    setCurrentRound(lastRound);
    setCurrentThow(lastThow);
  };

  const throwBall = ($event) => {
    if (rollingBall || currentThow == null) {
      return;
    }
    setRollingBall(true);

    const clickOnStrikeOrSpareButton = [spareButton().props.className, strikeButton().props.className].includes($event.target.className);
    rounds[currentRound][currentThow] = clickOnStrikeOrSpareButton ? activeAllPins() : animatedPins;

    setFootBowling(new Set([...footBowling].filter(pingNumber => !animatedPins.has(pingNumber))));
    setAnimatedPins(new Set());
    setRounds({ ...(rounds) });

    // TODO: (DISCUSS) When in new first throw of round hit a bowl recorded on second round
    // Caused inconsistent error:
    // 1st opt. When throw fixing first error -> clear second error (maybe user doesn't remember 2nd throw)
    // 2nd opt. When throw fixing first throw with a pin declared in 2nd round show an alert like "Pin X is recorded in 2nd round"
    // we can detect fix throw now when current round/throw less last but with the logic...
    setTimeout(
      () => {
        next();
        setRollingBall(false);
      },
      1500
    );
  };

  const showScoreFirstThrow = (num) => {
    const amount = rounds[num][1].size;

    if (amount == 10) {
      return '';
    }

    if (amount == 0) {
      return '-';
    }

    return amount;
  };

  const showScoreSecondThrow = (num) => {
    if (rounds[num][1].size == 10) {
      return 'X';
    }

    if (rounds[num][2].size == 0) {
      return '-';
    }

    const amount = rounds[num][1].size + rounds[num][2].size;

    if (amount == 10) {
      return '/';
    }

    return amount;
  };

  const changePinActivation = (num) => {
    if (animatedPins.size == animatedPins.add(num).size) {
      animatedPins.delete(num);
      setAnimatedPins(new Set(animatedPins));
    } else {
      setAnimatedPins(new Set(animatedPins));
    }
  };

  const getScore = (roundNumber) => {
    let amount = 0;
    Object.keys(rounds).forEach(
      (roundNumberAcc) => {
        if (roundNumberAcc > roundNumber) return;

        Object.values(rounds[roundNumberAcc]).forEach((pinsNumbers) => {
          roundNumberAcc = Number(roundNumberAcc);
          amount += pinsNumbers.size;
        });

        if (isSpare(roundNumberAcc)) {
          amount += rounds[roundNumberAcc + 1][1].size;
        }
        if (isStrike(roundNumberAcc)) {
          if (isStrike(roundNumberAcc + 1)) {
            amount += rounds[roundNumberAcc + 1][1].size + rounds[roundNumberAcc + 2][1].size;
          } else {
            amount += rounds[roundNumberAcc + 1][1].size + rounds[roundNumberAcc + 1][2].size;
          }
        }
      }
    );
    return amount;
  };

  const isSpare = (roundNumber) => {
    const round = rounds[roundNumber];
    return round[1].size < 10 && (round[1].size + round[2].size) == 10;
  };

  const isStrike = (roundNumber) => {
    const round = rounds[roundNumber];
    return round[1].size == 10;
  };

  const checkThrowStyle = (throw_, round) => {
    return (round < currentRound || throw_ < currentThow) ? styles.usedBall : '';
  };

  const score = () => (
    <div className={styles.scoreBox}>
      <div className={styles.headerBox}>
        <div className={styles.throw + ' ' + styles.throw_ball_1 + ' ' + checkThrowStyle(1, currentRound)}></div>
        <div className={styles.throw + ' ' + styles.throw_ball_2 + ' ' + checkThrowStyle(2, currentRound)}></div>
        {currentRound}
      </div>
      <div className={styles.bodyBox}>
        <div className={styles.rowA}>
          <div className={styles.columnA}>{showScoreFirstThrow(currentRound)}</div>
          <div className={styles.columnB}>{showScoreSecondThrow(currentRound)}</div>
        </div>
        <div className={styles.rowB}>{getScore(currentRound)}</div>
      </div>
    </div>
  );

  const changeCurrentRound = (roundNum) => {
    if (roundNum == lastRound) {
      return changeCurrentRoundToLastRound();
    }
    setAnimatedPins(new Set());
    setCurrentRound(roundNum);
    setCurrentThow(null);
    upAllPins();
  }

  const changeCurrentRoundToLastRound = () => {
    setAnimatedPins(new Set());
    setCurrentRound(lastRound);
    setCurrentThow(lastThow);
    if (lastThow == 1) {
      upAllPins();
    } else {
      setFootBowling(new Set([...array10].filter(pingNumber => !rounds[lastRound][1].has(pingNumber))));
    }
  }

  const selectFirstThrow = () => {
    setCurrentThow(1);
    upAllPins();
    setAnimatedPins(rounds[currentRound][1]);
  }

  const selectSecondThrow = () => {
    setCurrentThow(2);
    setFootBowling(new Set([...array10].filter(pingNumber => !rounds[currentRound][1].has(pingNumber))));
    setAnimatedPins(rounds[currentRound][2]);
  }

  const throwIsPreviousToLast = (roundNumber, throwNumber) => {
    return (roundNumber < lastRound || throwNumber == null || throwNumber < lastRound);
  }

  const scorePinsResume = (roundNum) => (
    <div className={styles.pinsResume}>
      {array10.map((item) => <div className={styles.pinResume + ' ' + styles['pinResume' + item]}></div>)}
    </div>
  )

  const greenBall = () => (
    <div className={styles.greenBall}></div>
  )

  const purpleBall = () => (
    <div className={styles.purpleBall}></div>
  )

  const yellowBall = () => (
    <div className={styles.purpleBall}></div>
  )

  const strikeButton = () => (
    <div className={styles.strikeButton}></div>
  )

  const spareButton = () => (
    <div className={styles.spareButton}></div>
  )

  // TODO: we need disabled rounds greather than last round
  const scoreNav = (num) => (
    <div
      className={styles.carousel__nav_div + (num > lastRound ? ' ' + styles.carousel__nav_div_disabled : '')}
      onClick={() => (num <= lastRound) && changeCurrentRound(num)}
    >
      <div className={styles.carousel__nav_div_sub_div + ' ' + styles.carousel__nav_div_round}>{num}</div>
      <div className={styles.carousel__nav_div_hr}></div>
      <div className={styles.carousel__nav_div_sub_div + ' ' + styles.carousel__nav_div_round}>{getScore(num)}</div>
      <div className={styles.carousel__nav_div_hr}></div>
      <div className={styles.carousel__nav_div_sub_div + ' ' + styles.carousel__nav_div_resume}>
        { (num < lastRound) ? scorePinsResume(num) : (num > lastRound || lastThow == 1) ? greenBall() : purpleBall() }
      </div>
    </div>
  )

  const selectedAllPinImage = () => (
    <div className={styles.bowl + ' ' + styles.actionForAllPins} onClick={activeAllPins}>
      <div className={styles.pinTop + ' ' + styles.animatedPin}></div>
      <div className={styles.pinShawod + ' ' + styles.animatedPinShadow}></div>
    </div>
  );

  const unselectedAllPinImage = () => (
    <div className={styles.bowl + ' ' + styles.actionForAllPins} onClick={deactiveAllPins}>
      <div className={styles.pinTop}></div>
      <div className={styles.pinShawod}></div>
    </div>
  );

  const bowl = (num) => (
    <div
      id={'pin' + num}
      className={
        styles.bowl + ' ' +
        styles['pin' + num] +
        (!footBowling.has(num) ? (' ' + styles['pum' + num]) : '')
      }
    >
      <div
        className={
          styles.pinTop +
          (animatedPins.has(num) ? ' ' + styles.animatedPin : '')
        }
        onClick={() => changePinActivation(num)}
      ></div>
      <div className={
        styles.pinShawod +
        (animatedPins.has(num) ? ' ' + styles.animatedPinShadow : '')
      }></div>
    </div>
  );

  return (
    <div id="container" className={styles.container}>
      {score()}
      <div className={styles.carousel__nav}>
        {array10.map((item) => scoreNav(item))}
      </div>
      <div id="bowls" className={styles.bowls}>
        {array10.map((item) => bowl(item))}
      </div>
      <div className={styles.throwSection}>
        <div className={styles.throwSectionSide + ' ' + styles.throwSectionSideLeft}>
          {selectedAllPinImage()}
          {unselectedAllPinImage()}
        </div>
        <div id="ball" className={
          styles.ball + (rollingBall ? ' ' + styles.animatedBall : '') 
        } onClick={throwBall}>
          {currentThow == 1 && greenBall()}
          {currentThow == 2 && purpleBall()}
          {currentThow == 3 && yellowBall()}
        </div>
        <div className={styles.throwSectionSide} onClick={throwBall}>
          {currentThow == 1 ? strikeButton() : spareButton()}
        </div>
      </div>
      <div className={styles.ballsToTake}>
        {(currentThow != 1 && throwIsPreviousToLast(currentRound, 1)) && <div onClick={selectFirstThrow}>{greenBall()}</div>}
        {(currentThow != 2 && throwIsPreviousToLast(currentRound, 2)) && <div onClick={selectSecondThrow}>{purpleBall()}</div>}
      </div>
    </div>
  );
}
