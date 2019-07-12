import {BehaviorSubject, fromEvent, interval, combineLatest} from 'rxjs';
import {map, tap, scan, switchMap, takeWhile, finalize, startWith, mergeMap} from 'rxjs/operators';

window.addEventListener('load', () => {
  const scoreElement = document.getElementById('score');
  const levelElement = document.getElementById('level');
  const lettersFieldElement = document.getElementById('lettersField');

  const LEVEL_CHANGE_THRESHOLD = 20;
  const GAME_WIDTH = 30;
  const END_THRESHOLD = 15;
  const SPEED_ADJUST = 50;

  function randomLetter() {
    return String.fromCharCode(
      Math.random() * ('z'.charCodeAt(0) - 'a'.charCodeAt(0)) + 'a'.charCodeAt(0),
    );
  }

  function getXCoordinate(width) {
    return Math.floor(Math.random() * width)
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
    letter.style.transform = `translateY(${yCoordinate}px)`
  }

  const interval$ = new BehaviorSubject(1000);
  const lastLetter$ = new BehaviorSubject('');
  const randomLetters$ = interval$
    .pipe(
      switchMap((i) => interval(i)
        .pipe(
          map((_) => ({
            xCoordinate: getXCoordinate(GAME_WIDTH),
            value: randomLetter(),
          })),
          tap(leter => console.log(leter)),
          tap((letter) => lastLetter$.next(letter.value)),
          map((letter) => createLetterRow(letter)),
          tap((letterElement) => addLetter(letterElement)),
          tap(le => console.log('el', le)),
          mergeMap((letterElement) => interval(1000)
            .pipe(
              tap((i) => updateLetterPosition(letterElement, i * 30))
            ))
        )),
    ).subscribe()

  //
  // function renderGame(state) {
  //   console.log('rendering')
  //   scoreElement.innerText = state.score;
  //   levelElement.innerText = state.level;
  //   let lettersField = '';
  //
  //   state.letters.forEach((letter) => {
  //     lettersField +=
  //       '&nbsp'.repeat(letter.xCoordinate) + letter.value + '<br/>';
  //   });
  //
  //   lettersField +=
  //     '<br/>'.repeat(END_THRESHOLD - state.letters.length - 1) +
  //     '-'.repeat(GAME_WIDTH);
  //   lettersFieldElement.innerHTML = lettersField;
  // }
  //
  // function renderGameOver() {
  //   document.body.innerHTML += '<br/>GAME OVER';
  // }
  //
  // const noop = () => {
  // };
  //
  // const intervalSubject = new BehaviorSubject(600);
  //
  // const initialLettersState = {
  //   letters: [],
  //   interval: 0,
  // };
  //
  // function updateLetters(letters, i) {
  //   return {
  //     interval: i,
  //     letters: [        {
  //       value: randomLetter(),
  //       xCoordinate: Math.floor(Math.random() * GAME_WIDTH),
  //     },
  //       ...letters.letters,
  //     ],
  //   };
  // }
  //
  // const letters$ = intervalSubject
  //   .pipe(
  //     switchMap((i) => interval(i)
  //       .pipe(
  //         scan(updateLetters, initialLettersState),
  //       ),
  //     ),
  //   );
  //
  // const keys$ = fromEvent(document, 'keydown')
  //   .pipe(
  //     startWith({key: ''}),
  //     map((e) => e.key),
  //   );
  //
  // const initialState = {score: 0, letters: [], level: 1};
  //
  // function updateState(state, [key, letters]) {
  //   const lastLetter = letters.letters.slice(-1)[0];
  //   const isNewLevel = state.score > 0 && state.score % LEVEL_CHANGE_THRESHOLD === 0;
  //   console.log('isnew level', isNewLevel)
  //   console.log('letters', letters)
  //   if (lastLetter && lastLetter.value === key) {
  //     return {
  //       score: state.score + 1,
  //       letters: isNewLevel ? [] : letters.letters.slice(0, -1),
  //       level: isNewLevel ? state.level + 1 : state.level,
  //     };
  //   }
  //
  //   return {
  //     ...state,
  //     letters: letters.letters.slice(),
  //   };
  // }
  //
  // combineLatest(keys$, letters$)
  //   .pipe(
  //     scan(updateState, initialState),
  //     tap(value => console.log(value)),
  //     takeWhile(state => state.letters.length < END_THRESHOLD),
  //   )
  //   .subscribe(
  //     renderGame,
  //     () => {
  //     },
  //     // renderGameOver,
  //   );
});

