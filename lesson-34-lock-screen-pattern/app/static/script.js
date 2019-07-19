import {from, fromEvent, merge} from 'rxjs';
import {distinct, map, mergeMap, sequenceEqual, startWith, switchMap, takeUntil, toArray} from 'rxjs/operators';

const storedSequence$ = from(['0', '1', '2']);

function getValue(event) {
  return event.target.dataset.value;
}

window.addEventListener('load', () => {
  const cellElements = Array.from(document.getElementsByClassName('lock__cell'));
  const mouseOverEvents$ = merge(...cellElements.map((element) => fromEvent(element, 'mouseenter')))
    .pipe(
      map(getValue)
    );
  const mouseDownEvents$ = merge(...cellElements.map((element) => fromEvent(element, 'mousedown')));
  const mouseUpEvents$ = fromEvent(document, 'mouseup');
  const patternInput$ = mouseDownEvents$
    .pipe(
      switchMap((mouseDownEvent) => mouseOverEvents$
        .pipe(
          startWith(getValue(mouseDownEvent)),
          distinct()
        )),
      takeUntil(mouseUpEvents$),
      toArray(),
      mergeMap((sequence) => from(sequence).pipe(sequenceEqual(storedSequence$)))
    );

  function onPasswordInput(isCorrect) {
    if (isCorrect) {
      location.assign('https://rxjs-dev.firebaseapp.com')
    } else {
      patternInput$.subscribe(onPasswordInput)
    }
  }

  patternInput$.subscribe(onPasswordInput)
});

