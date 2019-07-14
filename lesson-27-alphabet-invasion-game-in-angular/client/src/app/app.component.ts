import {AfterViewInit, Component, ViewChild} from '@angular/core';
import {Observable, of} from 'rxjs';
import {finalize, scan, takeWhile} from 'rxjs/operators';
import {AppService} from './app.service';
import {Key, Letter, State} from './app.types';
import {GameComponent} from './game/game.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements AfterViewInit {

  @ViewChild(GameComponent, {static: false}) gameComponent: GameComponent;

  game$: Observable<State> = of(this.service.initialState);

  constructor(
    private service: AppService,
  ) {
  }

  private updateState(
    state: State,
    [letter, key, gameIsOver]: [Letter, Key, boolean]): State {
    if (letter.timestamp > key.timestamp) {
      const letterElement = this.getLastChild(this.lettersField);
      if (letterElement) {
        this.service.intersectionObserver.observe(letterElement);
      }

      return {
        ...state,
        gameIsOver,
        letters: state.letters.concat([letter]),
      };
    }

    const updatedState = {...state, gameIsOver};

    if (updatedState.letters.length > 0 && updatedState.letters[0].value === key.value) {
      // try restarting real fast without the next 4 lines
      const currentElement = this.lettersField.children[0];
      if (currentElement) {
        this.service.intersectionObserver.unobserve(this.lettersField.children[0]);
      }
      const nextElement = this.lettersField.children[1];
      if (nextElement) {
        nextElement.classList.add('current-letter');
      }
      updatedState.letters = updatedState.letters.slice(1);
      updatedState.score = updatedState.score + 1;
    }

    if (updatedState.score > 0 && updatedState.score % this.service.config.LEVEL_CHANGE_THRESHOLD === 0) {
      updatedState.level = updatedState.level + 1;
      let newInterval = letter.interval - this.service.config.SPEED_ADJUST;
      newInterval = newInterval < this.service.config.MIN_INTERVAL
        ? this.service.config.MIN_INTERVAL
        : newInterval;
      this.service.interval$.next(newInterval);
    }

    return updatedState;
  }

  ngAfterViewInit() {
    this.service.intersectionObserver =
      new IntersectionObserver(this.service.onThresholdCross.bind(this.service), {
        root: this.lettersField,
        rootMargin: '0px 20px 0px 20px',
        threshold: 0.99,
      });
  }

  get lettersField() {
    return this.gameComponent.lettersField.nativeElement;
  }

  getLastChild(element: Element) {
    return Array.from(element.children).slice(-1)[0];
  }

  gameIsNotOver(state: State) {
    return !state.gameIsOver;
  }

  start() {
    this.service.intersectionObserver.disconnect();

    this.game$ = this.service.game$
      .pipe(
        scan(this.updateState.bind(this), this.service.initialState),
        takeWhile(this.gameIsNotOver),
        finalize(() => {
          this.service.gameOver$.next(false);
        }),
      );
  }
}
