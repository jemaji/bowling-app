import styles from '../styles/Bowls.module.css';
import Router from 'next/router';

function reset() {
  Router.reload(window.self.location.pathname);
  data.play1.round = 3;
}

let data = {
  play1: {
    round: 1,

  }
};

function spare() {
  console.log('PENDING SPARE');
}

function next() {
  console.log('PENDING NEXT');
}

function strike(event) {
  for (let index = 1; index <= 10; index++) {
    changePum(event, index);    
  }
}

function score(num) {
  return (
    <div id="scoreBox" className={styles.scoreBox}>
      <div id="headerBox" className={styles.headerBox}>{data['play'+1].round}</div>
      <div id="bodyBox" className={styles.bodyBox}>
        <div id="rowA" className={styles.rowA}>
          <div id="columnA" className={styles.columnA}>A</div>
          <div id="columnB" className={styles.columnB}>B</div>
        </div>
        <div id="rowB" className={styles.rowB}>88</div>
      </div>
    </div>
  );
}

function bowl(num) {
  return (
    <div
      id={'pin' + num}
      className={styles.bowl + ' ' + styles['pin' + num]}
      onClick={(e) => changePum(e, num)}
    >
      <div id="top" className={styles.top}></div>
      <div id="neck" className={styles.neck}></div>
      <div id="bottom" className={styles.bottom}></div>
    </div>
  );
}

function changePum(event, num) {
  document.getElementById('pin' + num).className += ' ' + styles['pum' + num];
}

export default function Bowls() {
  return (
    <div id="container" className={styles.container}>
      <div id="buttons" className={styles.buttons}>
        <button id="reset" onClick={reset}>RESET</button>
        <button id="strike" onClick={strike}>STRIKE</button>
        <button id="spare" onClick={spare}>SPARE</button>
        <button id="next" onClick={next}>NEXT</button>
      </div>
      {score(2)}
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
