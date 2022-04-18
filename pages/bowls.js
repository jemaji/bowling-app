import styles from '../styles/Bowls.module.css';
import Router from 'next/router';
import { useState } from 'react';
import bowlBackground from '../assets/images/pin.png'


export default function Bowls() {
  const getInitialRounds = () => {
    const roundNumbers = Array.from({length: 10}, (_, i) => i+1);
    const throwNumbers = Array.from({length: 2}, (_, i) => i+1);
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

  const initialiceProperties = () => {
    setCurrentRound(1);
    setCurrentThow(1);
    setRounds(getInitialRounds());
  };

  const reset = () => initialiceProperties();

  const strike = (event) => {
    const pinNumbers = Array.from({length: 10}, (_, i) => i+1);
    rounds[currentRound][1] = pinNumbers;
    setRounds({...rounds});
    setCurrentThow(2);
  };

  const spare = () => {
    setCurrentThow(2);
    const pinNumbers = Array.from({length: 10}, (_, i) => i+1);
    pinNumbers.forEach((pinNumber) => {
      if(!rounds[currentRound][1].has(pinNumber)) {
        rounds[currentRound][2].add(pinNumber);
      }
    });
    setRounds({...rounds});
  }

  const next = () => {
    if(currentThow == 1) {
      setCurrentThow(2);
      return;
    }
    setCurrentRound(currentRound + 1);
    setCurrentThow(1);
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

  const getScore = (roundNumber) => {
    let amount = 0;
    Object.keys(rounds).forEach(
      (roundNumberAcc) => {
        if(roundNumberAcc > roundNumber) return;

        Object.values(rounds[roundNumberAcc]).forEach((pinsNumbers) => {
          roundNumberAcc = Number(roundNumberAcc);
          amount += pinsNumbers.size;
        });

        if(roundNumber == roundNumberAcc) return;

        if(isSpare(roundNumberAcc)) {
          console.log('isSpare');
          amount += rounds[roundNumberAcc+1][1].size;
        }
        if(isStrike(roundNumberAcc)) {
          if(isStrike(roundNumberAcc + 1)) {
            amount += rounds[roundNumberAcc+1][1].size + rounds[roundNumberAcc+2][1].size;
          } else {
            amount += rounds[roundNumberAcc+1][1].size + rounds[roundNumberAcc+1][2].size;
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

  const score = () => (
    <div id="scoreBox" className={styles.scoreBox}>
      <div id="headerBox" className={styles.headerBox}>{currentRound}</div>
      <div id="bodyBox" className={styles.bodyBox}>
        <div id="rowA" className={styles.rowA}>
          <div id="columnA" className={styles.columnA}>{showScoreFirstThrow()}</div>
          <div id="columnB" className={styles.columnB}>{showScoreSecondThrow()}</div>
        </div>
        <div id="rowB" className={styles.rowB}>{getScore(currentRound)}</div>
      </div>
    </div>
  );

  const bowl = (num) => (
    <div
      id={'pin' + num}
      className={styles.bowl + ' ' + styles['pin' + num] + (rounds[currentRound][1].has(num) || rounds[currentRound][2].has(num) ? (' ' + styles['pum' + num]) : '')}
      onClick={() => {rounds[currentRound][currentThow].add(num); setRounds({...(rounds)});}}
      style={{backgroundImage: `url(${bowlBackground.src})`}}
    ></div>
  );

  return (
    <div id="container" className={styles.container}>
      <div id="buttons" className={styles.buttons}>
        <button id="reset" onClick={reset}>RESET</button>
        <button id="strike" onClick={strike}>STRIKE</button>
        <button id="spare" onClick={spare}>SPARE</button>
        <button id="next" onClick={next}>NEXT</button>
      </div>
      {score()}
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
    </div>
  );
}
