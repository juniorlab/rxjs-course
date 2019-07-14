import {EventEmitter, Injectable, Output} from '@angular/core';
import {BehaviorSubject, combineLatest, fromEvent, interval, Observable} from 'rxjs';
import {map, startWith, switchMap} from 'rxjs/operators';
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

  private initialLetter: Letter = {
    interval: 800,
    timestamp: 0,
    xCoordinate: 1,
    value: '',
  };

  private initialKey: Key = {
    timestamp: 1,
    value: '',
  };

  initialState: State = {
    gameIsOver: false,
    letters: [this.initialLetter],
    score: -1,
    level: 1,
  };

  intersectionObserver: IntersectionObserver;

  interval$ = new BehaviorSubject(this.config.INITIAL_INTERVAL);

  private keys$ = fromEvent(document, 'keydown')
    .pipe(
      startWith({key: ''} as KeyboardEvent),
      map((event: Event) => ({
        timestamp: new Date().valueOf(),
        value: (event as KeyboardEvent).key,
      })),
    );

  private randomLetters$: Observable<Letter> = this.interval$
    .pipe(
      switchMap((gameInterval) => interval(gameInterval)
        .pipe(
          map(() => ({
            interval: gameInterval,
            timestamp: new Date().valueOf(),
            xCoordinate: this.getRandomXCoordinate(this.config.GAME_WIDTH),
            value: this.randomLetter(),
          } as Letter)),
        )),
    );


  gameOver$ = new BehaviorSubject(false);

  game$ = combineLatest(
    this.randomLetters$.pipe(startWith(this.initialLetter)),
    this.keys$.pipe(startWith(this.initialKey)),
    this.gameOver$,
  );

  constructor() {
  }

  onThresholdCross(entries: IntersectionObserverEntry[]) {
    entries.forEach((entry) => {
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
