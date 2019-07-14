import {EventEmitter, Injectable, Output} from '@angular/core';
import {BehaviorSubject, combineLatest, fromEvent, interval, Observable, Subject} from 'rxjs';
import {map, multicast, refCount, scan, startWith, switchMap, tap} from 'rxjs/operators';
import {Key, Letter, State} from './app.types';

@Injectable({
  providedIn: 'root',
})
export class AppService {

  @Output() removeChild = new EventEmitter();

  config = {
    GAME_WIDTH: 30,
    INITIAL_INTERVAL: 800,
    LEVEL_CHANGE_THRESHOLD: 5,
    MIN_INTERVAL: 300,
    SPEED_ADJUST: 50,
  };

  initialLetter: Letter = {
    interval: 800,
    timestamp: 0,
    xCoordinate: 1,
    value: '',
  };

  initialKey: Key = {
    timestamp: 1,
    value: '',
  };

  initialState: State = {
    gameIsOver: false,
    letters: [this.initialLetter],
    score: 0,
    level: 1,
  };

  intersectionObserver: IntersectionObserver;

  interval$ = new BehaviorSubject(this.config.INITIAL_INTERVAL);
  keys$ = fromEvent(document, 'keydown')
    .pipe(
      startWith({key: ''} as KeyboardEvent),
      map((event: Event) => ({
        timestamp: new Date().valueOf(),
        value: (event as KeyboardEvent).key,
      })),
    );

  private _randomLettersSource$: Observable<Letter> = this.interval$
    .pipe(
      switchMap((gameInterval) => interval(gameInterval)
        .pipe(
          map((_) => ({
            interval: gameInterval,
            timestamp: new Date().valueOf(),
            xCoordinate: this.getRandomXCoordinate(this.config.GAME_WIDTH),
            value: this.randomLetter(),
          } as Letter)),
        )),
    );

  randomLetters$: Observable<Letter>
    = this._randomLettersSource$.pipe(multicast(new Subject()), refCount());

  gameOver$ = new BehaviorSubject(false);

  _game$ = combineLatest(
    this.randomLetters$.pipe(startWith(this.initialLetter)),
    this.keys$.pipe(startWith(this.initialKey)),
    this.gameOver$,
  );


  constructor() {
  }

  onThresholdCross(entries: IntersectionObserverEntry[]) {
    entries.forEach(entry => {
      console.debug('entry.intersectionRatio',entry.intersectionRatio)
      if (entry.intersectionRatio < 1) {
        this.gameOver$.next(true);
        this.intersectionObserver.disconnect();
      }
    });
  }

  randomLetter(): string {
    return String.fromCharCode(
      Math.random() * ('z'.charCodeAt(0) - 'a'.charCodeAt(0)) + 'a'.charCodeAt(0),
    );
  }

  getRandomXCoordinate(width: number): number {
    return Math.floor(Math.random() * width);
  }
}
