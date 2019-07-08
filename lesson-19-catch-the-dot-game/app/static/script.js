import {
  fromEvent,
  interval,
} from 'rxjs';
import {
  map,
  scan,
  switchMap,
  tap,
  takeWhile,
} from 'rxjs/operators';

window.addEventListener('load', () => {
  const timerElement = document.getElementById('timer');
  const dotElement = document.getElementById('dot');

  function setTimerText(text) {
    timerElement.innerText = text;
  }

  function makeInterval(state) {
    return interval(state.interval).pipe(
      map((i) => 5 - i),
      tap((remaining) => {
        setTimerText(remaining);
      }),
    );
  }

  const initialState = {
    score: 0,
    interval: 500,
  };

  function updateState(state) {
    return {
      score: state.score + 1,
      interval: state.score % 3 === 0
        ? state.interval - 50
        : state.interval,
    };
  }

  function gameIsNotOver(interval) {
    return interval >= 0;
  }

  function randomSpot() {
    return Math.random() * 300;
  }

  // https://stackoverflow.com/a/5365036/8544967
  function makeRandomColor() {
    return '#' + (Math.random() * 0xFFFFFF << 0).toString(16);
  }

  function updateDot(score) {
    dotElement.innerText = score;
    if (score % 3 === 0) {
      dotElement.style.backgroundColor = makeRandomColor();
    }
  }

  function setDotSize(size) {
    dotElement.style.height = `${size}px`;
    dotElement.style.width = `${size}px`;
  }

  function resizeAndMoveDot() {
    setDotSize(5);
    dotElement.style.transform = `translate(${randomSpot()}px, ${randomSpot()}px)`;
  }

  function resetDotSize() {
    setDotSize(30);
  }

  const game$ = fromEvent(dotElement, 'mouseover')
    .pipe(
      tap(resizeAndMoveDot),
      scan(updateState, initialState),
      tap((state) => updateDot(state.score)),
      switchMap(makeInterval),
      tap(resetDotSize),
      takeWhile(gameIsNotOver),
    );

  game$.subscribe({
    complete: () => setTimerText('Game Over'),
  });
});

