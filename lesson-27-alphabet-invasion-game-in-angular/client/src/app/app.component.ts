import {animate, style, transition, trigger} from '@angular/animations';
import {
  AfterViewChecked,
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
} from '@angular/core';
import {concat, Observable, of} from 'rxjs';
import {finalize, scan, startWith, subscribeOn, takeWhile, tap} from 'rxjs/operators';
import {AppService} from './app.service';
import {Key, Letter, State} from './app.types';
import {GameComponent} from './game/game.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements AfterViewInit {

  // @ViewChild('lettersField', {static: false}) lettersField: ElementRef;
  @ViewChild(GameComponent, {static: false}) gameComponent: GameComponent;

  letters: Letter[] = [];
  game$: Observable<State> = of(this.service.initialState);

  constructor(
    private service: AppService,
    private cdref: ChangeDetectorRef,
  ) {
  }

  private updateState(
    state: State,
    [letter, key, gameIsOver]: [Letter, Key, boolean]): State {
    if (letter.timestamp > key.timestamp) {
      const letterElement = this.getLastChild(this.gameComponent.lettersField.nativeElement);
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
      this.service.intersectionObserver.unobserve(this.gameComponent.lettersField.nativeElement.children[0]);
      const nextElement = this.gameComponent.lettersField.nativeElement.children[1];
      if (nextElement) {
        nextElement.classList.add('current-letter');
      }
      updatedState.letters = updatedState.letters.slice(1);
      updatedState.score = updatedState.score + 1;
    }

    if (updatedState.score > 0 && updatedState.score % this.service.config.LEVEL_CHANGE_THRESHOLD === 0) {
      updatedState.level = updatedState.level + 1;
      let newInterval = letter.interval - this.service.config.SPEED_ADJUST;
      newInterval = newInterval < this.service.config.MIN_INTERVAL ? this.service.config.MIN_INTERVAL : newInterval;
      this.service.interval$.next(newInterval);
    }

    return updatedState;
  }

  ngAfterViewInit() {
    this.service.intersectionObserver =
      new IntersectionObserver(this.service.onThresholdCross.bind(this.service), {
        root: this.gameComponent.lettersField.nativeElement,
        rootMargin: '0px 20px 0px 20px',
        threshold: 0.99,
      });
  }

  getLastChild(element: Element) {
    return Array.from(element.children).slice(-1)[0];
  }

  start() {
    console.log('start', this.service.initialState);
    this.service.intersectionObserver.disconnect();
    console.log('disconnected')

    this.game$ = this.service._game$
      .pipe(
        scan(this.updateState.bind(this), this.service.initialState),
        tap(state => console.log(state)),
        takeWhile((state) => !state.gameIsOver),
        finalize(() => this.service.gameOver$.next(false)),
      );
  }
}
