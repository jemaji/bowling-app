import styles from '../styles/Bowls.module.css';
import { useState } from 'react';

export default function Bowls() {
  const getInitialRounds = () => {
    const roundNumbers = Array.from({ length: 10 }, (_, i) => i + 1);
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

  const [currentRound, setCurrentRound] = useState(1);
  const [currentThow, setCurrentThow] = useState(1);
  const [rounds, setRounds] = useState(getInitialRounds());
  const [animatedPins, setAnimatedPins] = useState(new Set());
  const [asyncLock, setAsyncLock] = useState(false);

  const initialiceProperties = () => {
    setCurrentRound(1);
    setCurrentThow(1);
    setRounds(getInitialRounds());
  };

  const reset = () => initialiceProperties();

  const strike = (event) => {
    const pinNumbers = Array.from({ length: 10 }, (_, i) => i + 1);
    rounds[currentRound][1] = pinNumbers;
    setRounds({ ...rounds });
    setCurrentThow(2);
  };

  const spare = () => {
    setCurrentThow(2);
    const pinNumbers = Array.from({ length: 10 }, (_, i) => i + 1);
    pinNumbers.forEach((pinNumber) => {
      if (!rounds[currentRound][1].has(pinNumber)) {
        rounds[currentRound][2].add(pinNumber);
      }
    });
    setRounds({ ...rounds });
  }

  const next = () => {
    if (currentThow == 2 || isStrike(currentRound)) {
      setCurrentRound(currentRound + 1);
      setCurrentThow(1);
      return;
    }
    setCurrentThow(2);
  };

  const changeRollingBall = () => {
    const classRollingBall = 'animatedBall';
    const className = document.getElementById('ball').className;
    if (className.includes(classRollingBall)) {
      document.getElementById('ball').className = styles['ball'];
    } else {
      document.getElementById('ball').className += ` ${styles[classRollingBall]}`;
    }

  }

  const throwBall = () => {
    if (!asyncLock) {
      setAsyncLock(true);
      rounds[currentRound][currentThow] = new Set(animatedPins);
      setAnimatedPins(new Set());
      setRounds({ ...(rounds) });
      changeRollingBall();
      setTimeout(
        () => {
          next();
          setAsyncLock(false);
          changeRollingBall();
        },
        1500
      );
    }
  };

  const showScoreFirstThrow = () => {
    const amount = rounds[currentRound][1].size;

    if (amount == 10) {
      return '';
    }

    if (amount == 0) {
      return '-';
    }

    return amount;
  };

  const showScoreSecondThrow = () => {
    if (rounds[currentRound][1].size == 10) {
      return 'X';
    }

    if (rounds[currentRound][2].size == 0) {
      return '-';
    }

    const amount = rounds[currentRound][1].size + rounds[currentRound][2].size;

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

        if (roundNumber == roundNumberAcc) return;

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

  const score = (num) => (
    <div id={'slide-' + num} className={styles['slides-item']}>
      <div id={'scoreBox' + num} className={styles.scoreBox}>
        <div id={'headerBox' + num} className={styles.headerBox}>{num}</div>
        <div id={'bodyBox' + num} className={styles.bodyBox}>
          <div id={'rowA' + num} className={styles.rowA}>
            <div id={'columnA' + num} className={styles.columnA}>{showScoreFirstThrow()}</div>
            <div id={'columnB' + num} className={styles.columnB}>{showScoreSecondThrow()}</div>
          </div>
          <div id={'rowB' + num} className={styles.rowB}>{getScore(num)}</div>
        </div>
      </div>
    </div>
  );

  const bowl = (num) => (
    <div
      id={'pin' + num}
      className={
        styles.bowl + ' ' +
        styles['pin' + num] +
        (rounds[currentRound][1].has(num) || rounds[currentRound][2].has(num) ? (' ' + styles['pum' + num]) : '')
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
      <div id="buttons" className={styles.buttons}>
        <button id="reset" onClick={reset}>RESET</button>
        <button id="strike" onClick={strike}>STRIKE</button>
        <button id="spare" onClick={spare}>SPARE</button>
        <button id="next" onClick={next}>NEXT</button>
      </div>
      <div className={styles.carousel}>
        <div className={styles.slides}>
          {score(1)}
          {score(2)}
          {score(3)}
          {score(4)}
          {score(5)}
          {score(6)}
          {score(7)}
          {score(8)}
          {score(9)}
          {score(10)}
        </div>
        <div className={styles.carousel__nav}>
          <a className={styles['slider-nav']} href="#slide-1">1</a>
          <a className={styles['slider-nav']} href="#slide-2">2</a>
          <a className={styles['slider-nav']} href="#slide-3">3</a>
          <a className={styles['slider-nav']} href="#slide-4">4</a>
          <a className={styles['slider-nav']} href="#slide-5">5</a>
          <a className={styles['slider-nav']} href="#slide-6">6</a>
          <a className={styles['slider-nav']} href="#slide-7">7</a>
          <a className={styles['slider-nav']} href="#slide-8">8</a>
          <a className={styles['slider-nav']} href="#slide-9">9</a>
          <a className={styles['slider-nav']} href="#slide-10">10</a>
        </div>
      </div>
      <div id="bowls" className={styles.bowls}>
        {bowl(1)}
        {bowl(2)}
        {bowl(3)}
        {bowl(4)}
        {bowl(5)}
        {bowl(6)}
        {bowl(7)}
        {bowl(8)}
        {bowl(9)}
        {bowl(10)}
      </div>
      <div id="ball" className={styles.ball} onClick={throwBall}>
      </div>
    </div>
  );
}
