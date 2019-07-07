import {fromEvent} from 'rxjs';
import {scan, timeInterval, tap, map} from 'rxjs/operators';

window.addEventListener('load', () => {
  const timerElement = document.getElementById('timer');
  const dot = document.getElementById('dot');

  function makeInterval(state) {
    interval(state.interval).pipe(
      map((i) => 5 - i),
      tap((remaining) => {
        timerElement.innerText = remaining;
      })
    )
  }

  const initialState = {
    score: 0,
    interval: 500
  };

  function updateState(state) {
    return {
      score: state.score + 1,
      interval: state.score % 3 === 0
        ? state.interval - 50
        : state.interval,
    }
  }

  function gameIsNotOver(interval) {
    return interval >= 0;
  }

  function randomSpot() {
    return Math.random() * 300;
  }

  // https://stackoverflow.com/a/7638362/8544967
  function makeRandomColor(){
    let c = '';
    while (c.length < 7) {
      c += (Math.random()).toString(16).substr(-6).substr(-1)
    }
    return '#'+c;
  }

  function updateDot(score) {
    if (score % 3) {
      dot.style.backgroundColor = makeRandomColor();
    }
  }

  function moveDot() {
    dot.style.height = '5px';
    dot.style.width = '5px';
    dot.style.transform = `translate(${randomSpot()}px, ${randomSpot()}px)`
  }

  const game$ = fromEvent(dot, 'mouseover')
    .pipe(
      tap(moveDot),
      scan(updateState, initialState),
      tap((state) => {})
    )
});

