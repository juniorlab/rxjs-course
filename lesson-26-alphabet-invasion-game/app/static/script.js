import {BehaviorSubject, fromEvent, interval, combineLatest, timer, Subject} from 'rxjs';
import {
  map,
  tap,
  scan,
  switchMap,
  takeWhile,
  finalize,
  startWith,
  mergeMap,
  multicast,
  refCount,
  withLatestFrom,
  timestamp,
} from 'rxjs/operators';

const LEVEL_CHANGE_THRESHOLD = 20;
const GAME_WIDTH = 30;
const END_THRESHOLD = 15;
const SPEED_ADJUST = 50;

window.addEventListener('load', () => {
  const scoreElement = document.getElementById('score');
  const levelElement = document.getElementById('level');
  const lettersFieldElement = document.getElementById('lettersField');

  // /**
  //  * @see https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API
  //  */
  // const intersectionObserver = new IntersectionObserver((entries) => {
  //   entries.forEach(entry => {
  //     if (entry.intersectionRatio < 0.999) {
  //       gameOver$.next(true);
  //     }
  //   });
  // }, {
  //   root: lettersFieldElement,
  //   rootMargin: '0px',
  //   threshold: [1],
  // });


  function randomLetter() {
    return String.fromCharCode(
      Math.random() * ('z'.charCodeAt(0) - 'a'.charCodeAt(0)) + 'a'.charCodeAt(0),
    );
  }

  function getXCoordinate(width) {
    return Math.floor(Math.random() * width);
  }

  function createLetterRow(letter) {
    const element = document.createElement('div');
    element.classList.add('letters-field__row');
    element.innerHTML = `${'&nbsp'.repeat(letter.xCoordinate)}${letter.value}`;
    return element;
  }

  function addLetter(letterElement) {
    lettersFieldElement.insertBefore(letterElement, lettersFieldElement.childNodes[0]);
  }

  function updateLetterPosition(letter, yCoordinate) {
    letter.style.transform = `translateY(${yCoordinate}px)`;
  }

  const interval$ = new BehaviorSubject(1000);
  // const lastRandomLetter$ = new BehaviorSubject('');

  const keys$ = fromEvent(document, 'keydown')
    .pipe(
      startWith({key: ''}),
      map((event) => ({
        timestamp: new Date().valueOf(),
        value: event.key,
      })),
    );

  const _randomLettersSource$ = interval$
    .pipe(
      switchMap((i) => interval(i)
        .pipe(
          map((_) => ({
            timestamp: new Date().valueOf(),
            xCoordinate: getXCoordinate(GAME_WIDTH),
            value: randomLetter(),
          })),
        )),
    );

  const randomLettersSource$ = new Subject();

  const randomLetters$ = _randomLettersSource$.pipe(multicast(randomLettersSource$), refCount());

  const transform$ = randomLetters$.pipe(
    map((letter) => createLetterRow(letter)),
    tap((letterElement) => {
      addLetter(letterElement);
    }),
    mergeMap((letterElement) => timer(0, 1000)
      .pipe(
        tap((i) => updateLetterPosition(letterElement, i * 30)),
      )),
  ).subscribe();

  function removeLetter() {
    console.log(lettersFieldElement.lastChild);
    lettersFieldElement.removeChild(lettersFieldElement.lastChild);
  }

  combineLatest(randomLetters$.pipe(
    startWith({
      timestamp: 0,
      xCoordinate: 1,
      value: '',
    })
  ), keys$.pipe(
    startWith({
      timestamp: 1,
      value: '',
    })
  ))
    .pipe(
      scan((state, [letter, key]) => {
        const updatedState = {...state};
        console.log('updatedState.letters[0]', updatedState.letters[0], ' <=');
        console.log('key.value', key.value, ' <=');
        if (letter.timestamp > key.timestamp) {
          return {
            ...state,
            letters: state.letters.concat([letter.value]),
          }
        }

        if (updatedState.letters[0] === key.value) {
          removeLetter();
          updatedState.letters = updatedState.letters.slice(1);
          updatedState.score = updatedState.score + 1;
          return updatedState;
        }
        return updatedState;
      }, {
        letters: [''],
        score: -1,
        level: 1,
      }),
      tap(state => console.log(state)),
      takeWhile((state) => state.letters.length !== END_THRESHOLD),
      finalize(() => transform$.unsubscribe())
    )
    .subscribe()
});

