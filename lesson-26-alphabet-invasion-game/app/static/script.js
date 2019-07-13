import {BehaviorSubject, combineLatest, fromEvent, interval, Subject} from 'rxjs';
import {finalize, map, multicast, refCount, scan, startWith, switchMap, takeWhile, tap} from 'rxjs/operators';

const GAME_WIDTH = 30;
const INITIAL_INTERVAL = 800;
const LEVEL_CHANGE_THRESHOLD = 5;
const MIN_INTERVAL = 300;
const SPEED_ADJUST = 50;

window.addEventListener('load', () => {
  const scoreElement = document.getElementById('score');
  const levelElement = document.getElementById('level');
  const lettersFieldElement = document.getElementById('lettersField');

  /**
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API
   */
  const intersectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.intersectionRatio < 1) {
        gameOver$.next(true);
      }
    });
  }, {
    root: lettersFieldElement,
    rootMargin: '0px 20px 0px 20px',
    threshold: 0.99,
  });


  function getCSSRule(query) {
    return Array.from(document.styleSheets)
      .map((item) => Array.from(item.cssRules))
      .reduce((a, b) => b.concat(a))
      .filter((rule) => rule.selectorText.lastIndexOf(query) === 0)[0];
  }

  function setInnerText(element, text) {
    element.innerText = text;
  }

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
    element.innerHTML = `${'&nbsp'.repeat(letter.xCoordinate)}<span>${letter.value}</span>`;
    return {
      ...letter,
      element,
    };
  }

  function addLetter(letterElement) {
    lettersFieldElement.insertBefore(letterElement, lettersFieldElement.firstChild);
    intersectionObserver.observe(letterElement);
  }

  function updateLetterPosition(letter, yCoordinate) {
    letter.style.transform = `translateY(${yCoordinate}px)`;
  }

  const interval$ = new BehaviorSubject(INITIAL_INTERVAL);

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
      switchMap((gameInterval) => interval(gameInterval)
        .pipe(
          map((_) => ({
            interval: gameInterval,
            timestamp: new Date().valueOf(),
            xCoordinate: getXCoordinate(GAME_WIDTH),
            value: randomLetter(),
          })),
        )),
    );

  const gameOver$ = new BehaviorSubject(false);

  // const randomLettersSource$ = new Subject();

  const randomLetters$ = _randomLettersSource$.pipe(multicast(new Subject()), refCount());

  const transform$ = randomLetters$.pipe(
    map((letter) => createLetterRow(letter)),
    tap((letter) => {
      addLetter(letter.element);
      requestAnimationFrame(() => {
        updateLetterPosition(letter.element, 0);
        requestAnimationFrame(() => {
          updateLetterPosition(letter.element, 385);
        });
      });
    }),
  ).subscribe();

  function removeLetter() {
    const node = Array.from(lettersFieldElement.children).slice(-1)[0];
    intersectionObserver.unobserve(node);
    lettersFieldElement.removeChild(node);
  }

  function styleCurrentLetter() {
    Array.from(lettersFieldElement.children).slice(-1)[0].children[0].classList.add('current_letter')
  }

  const initialState = {
    letters: [''],
    score: -1,
    level: 1,
  };

  function updateState(state, [letter, key, gameOver]) {
    if (letter.timestamp > key.timestamp) {
      return {
        ...state,
        gameOver,
        letters: state.letters.concat([letter.value]),
      };
    }

    const updatedState = {...state, gameOver};

    if (updatedState.letters[0] === key.value) {
      removeLetter();
      try {
        styleCurrentLetter();
      } catch (e) {

      }
      updatedState.letters = updatedState.letters.slice(1);
      updatedState.score = updatedState.score + 1;
      setInnerText(scoreElement, updatedState.score);

      if (updatedState.score > 0 && updatedState.score % LEVEL_CHANGE_THRESHOLD === 0) {
        updatedState.level = updatedState.level + 1;
        setInnerText(levelElement, updatedState.level);
        let newInterval = letter.interval - SPEED_ADJUST;
        newInterval = newInterval < MIN_INTERVAL ? MIN_INTERVAL : newInterval;
        interval$.next(newInterval);
        getCSSRule('.letters-field__row').style.transitionDuration = `${newInterval * 20}ms`
      }
      return updatedState;
    }

    return updatedState;
  }

  combineLatest(randomLetters$.pipe(
    startWith({
      interval: INITIAL_INTERVAL,
      timestamp: 0,
      xCoordinate: 1,
      value: '',
    }),
  ), keys$.pipe(
    startWith({
      timestamp: 1,
      value: '',
    }),
  ),gameOver$)
    .pipe(
      scan(updateState, initialState),
      takeWhile((state) => !state.gameOver),
      finalize(() => transform$.unsubscribe()),
    )
    .subscribe();
});

