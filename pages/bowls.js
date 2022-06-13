import styles from '../styles/Bowls.module.css';
import { useState, useEffect } from 'react';

export default function Bowls() {
  const debug = true;
  const array10 = Array.from({ length: 10 }, (_, i) => i + 1);

  const getInitialRounds = () => {
    const roundNumbers = [ ...array10, 11, 12, 13];
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
  const [lastThrow, setLastThrow] = useState(1);
  const [currentRound, setCurrentRound] = useState(1);
  const [currentThrow, setCurrentThrow] = useState(1);
  const [rounds, setRounds] = useState(getInitialRounds());
  const [animatedPins, setAnimatedPins] = useState(new Set());
  const [rollingBall, setRollingBall] = useState(false);
  const [footBowling, setFootBowling] = useState(new Set(array10));

  const initialiceProperties = () => {
    setLastRound(1);
    setLastThrow(1);
    setCurrentRound(1);
    setCurrentThrow(1);
    setRounds(getInitialRounds());
    setAnimatedPins(new Set());
    setRollingBall(false);
    setFootBowling(new Set(array10));
  };

  const reset = () => initialiceProperties();

  const activeAllPins = () => {
    let activatedPins;
    if (currentThrow == 1) {
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
    if (currentRound == lastRound && currentThrow == lastThrow) {
      updateLastRound();
    }

    nextLastRound();
  };

  const isGameFinished = () => {
    return (currentRound === 11 && !hasRound11()) 
      || (currentRound === 11 && currentThrow === 2 && isSpare(10))
      || (currentRound === 12 && !hasRound12()) 
      || (currentRound === 12 && currentThrow === 2 ) 
      || (currentRound === 13);
  }

  const nextLastRound = () => {
  //if (currentRound != lastRound) {
    // controlar mejor si no es strike ni spare, que se realicen los 2 tiros
    // setCurrentRound(lastRound);
    // setCurrentThrow(lastThrow);
  //} else 
  if (currentThrow == 2 || isStrike(currentRound)) {
      setCurrentRound(currentRound + 1);
      setCurrentThrow(1);
      upAllPins();

      if (currentThrow == 1) {
        rounds[currentRound][2] = new Set();
      }
      return;
    }

    // control de ronda 10
    //if (isGameFinished()) {
      //setCurrentRound(13)
    //} else {
      setCurrentThrow(2);
      setLastThrow(2);
    //}
  };

  const updateLastRound = () => {
    if (currentThrow == 2 || isStrike(currentRound)) {
      setLastRound(currentRound + 1);
      setLastThrow(1);
      return;
    }
    setLastThrow(2);
  };

  const reset1112 = () => {
    if (currentRound === 10) {
      rounds[10][2] = new Set();
      rounds[11][1] = new Set();
      rounds[11][2] = new Set();
      rounds[12][1] = new Set();
      setLastRound(11);
    }
  }

  const throwBall = ($event) => {
    if (rollingBall || currentThrow == null) {
      return;
    }
    setRollingBall(true);

    const strike = strikeButton().props.className === $event.target.className;
    const spare = spareButton().props.className === $event.target.className;

    if (currentThrow === 1) {
      rounds[currentRound][currentThrow + 1] = new Set();
    } 
    if (currentRound === 10) {
      reset1112();
    } 

    // const clickOnStrikeOrSpareButton = [spareButton().props.className, strikeButton().props.className].includes($event.target.className);
    rounds[currentRound][currentThrow] = strike || spare ? activeAllPins() : animatedPins;

    setFootBowling(new Set([...footBowling].filter(pingNumber => !rounds[currentRound][currentThrow].has(pingNumber))));
    setRounds({ ...(rounds) });
    setLastThrow(currentThrow);

    // TODO: (DISCUSS) When in new first throw of round hit a bowl recorded on second round
    // Caused inconsistent error:
    // 1st opt. When throw fixing first error -> clear second error (maybe user doesn't remember 2nd throw)
    // 2nd opt. When throw fixing first throw with a pin declared in 2nd round show an alert like "Pin X is recorded in 2nd round"
    // we can detect fix throw now when current round/throw less last but with the logic...
    setTimeout(
      () => {
        next();
        setRollingBall(false);
        setAnimatedPins(new Set());
      },
      1500
    );
  };

  const showScoreFirstThrow = (num) => {
    const amount = rounds[num][1].size;

    if (amount == 10) {
      if (num >= 10) {
        return 'X'
      }
      return '';
    }

    if (amount == 0) {
      return '-';
    }

    return amount;
  };

  const showScoreSecondThrow = (num) => {
    if (num === 10 && isStrike(10)) {
      return showScoreFirstThrow(11);
    }

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

  const showScoreThirdThrow = (num) => {
    if (num === 10) {
      if (isSpare(10) && isStrike(11)) {
        return showScoreFirstThrow(11);
      }

      if (isStrike(10) && !isStrike(11)) {
        return showScoreSecondThrow(11);
      } 

      if (isStrike(11)) {
        return showScoreFirstThrow(12);
      }
  
      if (isSpare(10)) {
        return showScoreFirstThrow(11);
      }
    }
    return '-';
  };

  const changePinActivation = (num) => {
    const activatedPins = new Set(animatedPins);
    if (activatedPins.size == activatedPins.add(num).size) {
      activatedPins.delete(num);
    }
    setAnimatedPins(new Set(activatedPins));
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
    return (round < currentRound || throw_ < currentThrow) ? styles.usedBall : '';
  };

  const visibleThirdThrowPoints = () => {
    return currentRound >= 10 
      && isStrike(10) || isSpare(10);
  }

  const score = () => (
    <div className={styles.scoreBox}>
      <div className={styles.headerBox}>
        <div className={styles.throw + ' ' + styles.throw_ball_1 + ' ' + checkThrowStyle(1, currentRound)}></div>
        <div className={styles.throw + ' ' + styles.throw_ball_2 + ' ' + checkThrowStyle(2, currentRound)}></div>
        {currentRound>=10 ? 10 : currentRound}
      </div>
      <div className={styles.bodyBox}>
        <div className={styles.rowA}>
          <div style={{width: visibleThirdThrowPoints() ? '33%' : ''}} className={styles.columnA}>{showScoreFirstThrow(currentRound >= 10 ? 10 : currentRound)}</div>
          <div style={{width: visibleThirdThrowPoints() ? '33%' : ''}} className={styles.columnB}>{showScoreSecondThrow(currentRound >= 10 ? 10 : currentRound)}</div>
          <div style={{display: visibleThirdThrowPoints() ? '' : 'none', width: visibleThirdThrowPoints() ? '33%' : ''}} className={styles.columnB}>{showScoreThirdThrow(currentRound >= 10 ? 10 : currentRound)}</div>
        </div>
        <div className={styles.rowB}>{getScore(currentRound>=10 ? 10 : currentRound)}</div>
      </div>
    </div>
  );

  const hasRound11 = () => {
    return isSpare(10) || isStrike(10);
  }

  const hasRound12 = () => {
    return hasRound11() && isStrike(11) && !isSpare(10);
  }

  const changeCurrentRound = (roundNum) => {
    if (roundNum == lastRound) {
      return changeCurrentRoundToLastRound();
    }
    setAnimatedPins(new Set());
    setCurrentRound(roundNum);
    setCurrentThrow(null);
    upAllPins();
  }

  const changeCurrentRoundToLastRound = () => {
    setAnimatedPins(new Set());
    setCurrentRound(lastRound);
    setCurrentThrow(lastThrow);
    if (lastThrow == 1) {
      upAllPins();
    } else {
      setFootBowling(new Set([...array10].filter(pingNumber => !rounds[lastRound][1].has(pingNumber))));
    }
  }

  const selectFirstThrow = () => {
    setCurrentThrow(1);
    upAllPins();
    setAnimatedPins(rounds[currentRound][1]);
  }

  const selectSecondThrow = () => {
    if (currentRound === 10 && isStrike(10)) {
      setCurrentRound(11);
      setCurrentThrow(1);
      setFootBowling(new Set([...array10].filter(pingNumber => !rounds[11][1].has(pingNumber))));
      setAnimatedPins(rounds[11][1]);
    }
    setCurrentThrow(2);
    setLastThrow(2);
    setFootBowling(new Set([...array10].filter(pingNumber => !rounds[currentRound][1].has(pingNumber))));
    setAnimatedPins(rounds[currentRound][2]);
  }

  const selectThirdThrow = () => {
    if ((isStrike(10) && isStrike(11))) {
      setCurrentRound(12);
      setCurrentThrow(1);
      setFootBowling(new Set([...array10].filter(pingNumber => !rounds[currentRound][1].has(pingNumber))));
      setAnimatedPins(rounds[currentRound][1]);
    }
  }

  const showSelectThrowBall = (roundNumber, throwNumber) => {
    if (roundNumber < 10) {
      return currentThrow != throwNumber
      && throwNumber !== 3
      && (
        roundNumber <= lastRound
        || throwNumber == null
        || throwNumber < lastThrow
      )
      && (
        throwNumber != 2
        || !isStrike(roundNumber)
      );
    } else {
      return currentThrow != throwNumber && (!currentThrow || currentThrow === 1) && throwNumber === 1;
      ;
    }

  }

  const scorePinsResume = (roundNum) => (
    <div className={styles.pinsResume}>
      {array10.map((item) => <div className={styles.pinResume + ' ' + styles['pinResume' + item] + ' ' + controlColorPinResume(roundNum, item)}></div>)}
    </div>
  )

  const controlColorPinResume = (roundNum, item) => {
    let resultStyle = '';
    if (roundNum === 12 && (rounds[roundNum][1] && rounds[roundNum][1].has(item))) {
      resultStyle = styles.pinResumeYellow;
    } else if (roundNum === 11 && isStrike(10) && (rounds[roundNum][1] && rounds[roundNum][1].has(item))) {
      resultStyle = styles.pinResumePurple;
    } else if (roundNum === 11 && isStrike(10) && (rounds[roundNum][2] && rounds[roundNum][2].has(item))) {
      resultStyle = styles.pinResumeYellow;
    } else if (roundNum === 11 && isSpare(10) && rounds[roundNum][1] && rounds[roundNum][1].has(item)) {
      resultStyle = styles.pinResumeYellow;
    } else if (rounds[roundNum][1] && rounds[roundNum][1].has(item)) {
      resultStyle = styles.pinResumeGreen;
    } else if (rounds[roundNum][2] && rounds[roundNum][2].has(item)) {
      resultStyle = styles.pinResumePurple;
    }
    return resultStyle;
  } 

  const colorBall = (color) => (
    <div className={styles[`${color}Ball`]}></div>
  )
  
  const greenBall = () => (
    <div className={styles.greenBall}></div>
  )

  const purpleBall = () => (
    <div className={styles.purpleBall}></div>
  )

  const yellowBall = () => (
    <div className={styles.yellowBall}></div>
  )

  const strikeButton = () => (
    <div className={styles.strikeButton}></div>
  )

  const spareButton = () => (
    <div className={styles.spareButton}></div>
  )

  const scoreNav = (num) => (
    <div
      className={(currentRound === num || (currentRound >= 10 && num === 10 && lastRound > 10)? styles.currentBorder + ' ':'') + 
      styles.carousel__nav_div + (num > lastRound ? ' ' + styles.carousel__nav_div_disabled : '')}
      onClick={() => (num <= lastRound) && changeCurrentRound(num)}
    >
      <div className={styles.carousel__nav_div_sub_div + ' ' + styles.carousel__nav_div_round}>{num}</div>
      <div className={styles.carousel__nav_div_hr}></div>
      <div className={styles.carousel__nav_div_sub_div + ' ' + styles.carousel__nav_div_round}>{getScore(num)}</div>
      <div className={styles.carousel__nav_div_hr}></div>
      <div className={styles.carousel__nav_div_sub_div}>
        { (num < lastRound) ? scorePinsResume(num) : (num > lastRound || lastThrow == 1) ? greenBall() : purpleBall() }
      </div>
    </div>
  )

  const scoreNavStrikeSpare10 = (num) => (
    <div style={{display: num === 10 && (isStrike(10) || isSpare(10)) ? 'block' : 'none'}}
        className={(currentRound === num || (currentRound >= 10 && num === 10 && lastRound > 10)? 
          styles.currentBorder + ' ':'') +  styles.carousel__nav_div + (num > lastRound ? ' ' + styles.carousel__nav_div_disabled : '')}
          onClick={() => (num <= lastRound) && changeCurrentRound(10)}>
      <div  className={styles.carousel__nav_div_sub_div}>
          { (11 < lastRound) ? scorePinsResume(11) : (lastThrow == 1) ? purpleBall() : yellowBall() }
      </div>
    </div>
  );

  const scoreNavStrike11 = (num) => (
    <div style={{display: num === 10 && isStrike(10) && isStrike(11) ? 'block' : 'none'}}
        className={(currentRound === num || (currentRound >= 10 && num === 10 && lastRound > 10) ? 
          styles.currentBorder + ' ':'') +  styles.carousel__nav_div + (num > lastRound ? ' ' + styles.carousel__nav_div_disabled : '')}
          onClick={() => (num <= lastRound) && changeCurrentRound(10)}>
      <div  className={styles.carousel__nav_div_sub_div}>
          { (12 < lastRound) ? scorePinsResume(12) : yellowBall() }
      </div>
    </div>
  );

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

  const endGame = () => {
    return <div className={styles.endGame}> 
    </div>
  }

  const containerBowling = () => (
    <div style={{marginTop: isStrike(10) && isStrike(11) ? '-80px' : ((currentRound === 11 || currentRound === 12) && (isStrike(10) || isSpare(10))) ? '-40px' : ''}}>
      <div id="bowls" className={styles.bowls}>
        {array10.map((item) => bowl(item))}
      </div>
      <div style={{display: currentThrow ? '' : 'none'}} className={styles.throwSection}>
        <div className={styles.throwSectionSide + ' ' + styles.throwSectionSideLeft}>
          {selectedAllPinImage()}
          {unselectedAllPinImage()}
        </div>
        <div id="ball" className={
          styles.ball + (rollingBall ? ' ' + styles.animatedBall : '') 
        } onClick={throwBall}>
          {currentThrow == 1 && currentRound <= 10 && greenBall()}
          {(currentThrow == 2 && currentRound != 11 || currentThrow == 1 && currentRound == 11 && isStrike(10)) && purpleBall()}
          {(currentRound == 12 || (currentRound == 11 && (currentThrow == 2 || isSpare(10)))) && yellowBall()}
        </div>
        <div className={styles.throwSectionSide} onClick={throwBall}>
          {currentThrow == 1 ? strikeButton() : spareButton()}
        </div>
      </div>
      <div className={styles.ballsToTake}>
        {(showSelectThrowBall(currentRound, 1)) && <div onClick={selectFirstThrow}>{greenBall()}</div>}
        {(showSelectThrowBall(currentRound, 2)) && <div onClick={selectSecondThrow}>{purpleBall()}</div>}
        {(showSelectThrowBall(currentRound, 3)) && <div onClick={selectThirdThrow}>{yellowBall()}</div>}
      </div>
    </div>
  );

  return (
    <div id="container" className={styles.container}>
      <div style={{position: 'absolute', top: 0, left: 0, fontSize: 10, fontWeight: 'bold', display: debug ? 'block' : 'none'}}>
        currentRound {currentRound}<br/>
        currentThrow {currentThrow}<br/>
        lastRound    {lastRound}<br/>
        lastThrow    {lastThrow}<br/>
      </div>
      {score()}
      <div className={styles.carousel__nav}>
        {array10.map((item) => scoreNav(item))}
      </div>
      <div className={styles.carousel__nav1112}>
        {array10.map((item) => scoreNavStrikeSpare10(item))}
      </div>
      <div className={styles.carousel__nav1112}>
        {array10.map((item) => scoreNavStrike11(item))}
      </div>
      {!isGameFinished() ? containerBowling() : endGame()}
    </div>
  );
}
