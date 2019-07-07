import {fromEvent} from 'rxjs';
import {scan, timeInterval, takeWhile, repeat} from 'rxjs/operators';

window.addEventListener('load', () => {
  const mainElement = document.getElementById('main');
  const outputElement = document.getElementById('output');

  function update(score) {
    outputElement.innerText = score;
    outputElement.style.fontSize = `${score}px`;
    score = score <= 100 ? (score / 100).toFixed(2) : 1;
    mainElement.style.backgroundColor = `rgba(255, 69, 0, ${score})`;
  }

  function reset() {
    update(0);
  }

  fromEvent(document, 'click')
    .pipe(
      timeInterval(),
      scan((state, timeInterval) => ({
          interval: timeInterval.interval,
          score: state.score + 1,
          threshold: state.threshold - 2,
        }), {
        interval: 0,
        score: 0,
        threshold: 300,
      }),
      takeWhile((state) => state.interval < state.threshold),
      repeat(),
    )
    .subscribe(
      (state) => update(state.score),
      () => {},
      () => reset()
    );
});
