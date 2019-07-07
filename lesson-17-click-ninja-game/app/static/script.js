import {fromEvent} from 'rxjs';
import {tap, scan, timeInterval} from 'rxjs/operators';

window.addEventListener('load', () => {
  const mainElement = document.getElementById('main');
  const outputElement = document.getElementById('output');
  const recordElement = document.getElementById('record');
  const fastestClickElement = document.getElementById('fastestClick');

  function updateInterface(score, record, interval) {

    if (record) {
      recordElement.innerText = record;
    }

    if (interval) {
      fastestClickElement.innerText = interval;
    }

    outputElement.innerText = score;
    outputElement.style.fontSize = `${score}px`;
    score = score <= 100 ? (score / 100).toFixed(2) : 1;
    mainElement.style.backgroundColor = `rgba(255, 69, 0, ${score})`;
  }

  function reset() {
    updateInterface(0);
  }

  const initialLocalState = {
    interval: 0,
    score: 0,
    threshold: 300,
  };

  fromEvent(document, 'click')
    .pipe(
      timeInterval(),
      scan((state, timeInterval) => {
        const interval = timeInterval.interval;

        if (interval > state.threshold) {
          return {
            ...state,
            ...initialLocalState,
          }
        }

        const score = state.score + 1;

        return {
          interval,
          score,
          fastestClick: state.fastestClick < interval
            ? state.fastestClick
            : interval,
          record: state.record > score
            ? state.record
            : score,
          threshold: state.threshold - 2,
        };
      }, {
        record: 0,
        fastestClick: Infinity,
        ...initialLocalState
      }),
      tap((state) => {
        if (state.score === 0) {
          reset()
        }
      })
    )
    .subscribe(
      (state) => updateInterface(state.score, state.record, state.fastestClick),
    );
});

