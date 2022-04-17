import styles from '../styles/Bowls.module.css';
import Router from 'next/router';

function reset() {
  Router.reload(window.self.location.pathname);
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

function changePum(cmp, num) {
  console.log(cmp);
  document.getElementById('pin' + num).className += ' ' + styles['pum' + num];
}

export default function Bowls() {
  return (
    <div id="container" className={styles.container}>
      <div id="buttons">
        <button />
      </div>
      <div id="score"></div>
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
