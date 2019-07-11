import {AfterViewInit, Component, ElementRef, ViewChild} from '@angular/core';
import {fromEvent, interval, Observable} from 'rxjs';
import {map, scan, switchMap, takeWhile, tap} from 'rxjs/operators';

interface State {
  interval: number;
  remaining: number;
  score: number;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements AfterViewInit {
  events$: Observable<State>;

  dotStyle = {
    'background-color': 'gray',
    'height.px': 30,
    'transform': 'translate(0,0)',
    'width.px': 30,
  };

  initialState: State = {
    interval: 500,
    remaining: 5,
    score: 0,
  };

  @ViewChild('dot', {static: false}) dot: ElementRef;

  private createSizes(size: number) {
    return {
      'height.px': size,
      'width.px': size,
    };
  }

  private randomSpot() {
    return Math.random() * 300;
  }

  // https://stackoverflow.com/a/5365036/8544967
  private makeRandomColor() {
    return '#' + (Math.random() * 0xFFFFFF << 0).toString(16);
  }

  private resizeAndMoveDot(score: number) {
    this.dotStyle = {
      ...this.dotStyle,
      ...this.createSizes(5),
      'background-color': score % 3 === 0 ? this.makeRandomColor() : this.dotStyle['background-color'],
      'transform': `translate(${this.randomSpot()}px, ${this.randomSpot()}px)`,
    };
  }

  private updateState(state: State) {
    return {
      score: state.score + 1,
      interval: state.score % 3 === 0
        ? state.interval - 50
        : state.interval,
    };
  }

  private makeInterval(state: State) {
    return interval(state.interval).pipe(
      map((i) => ({...state, remaining: 5 - i})),
    );
  }

  private resetDotSize() {
    this.dotStyle = {...this.dotStyle, ...this.createSizes(30)};
  }

  private gameIsNotOver(state: State) {
    return state.remaining >= 0;
  }

  ngAfterViewInit() {
    this.events$ = fromEvent(this.dot.nativeElement, 'mouseover')
      .pipe(
        scan(this.updateState, this.initialState),
        tap((state) => this.resizeAndMoveDot(state.score)),
        switchMap(this.makeInterval),
        tap(this.resetDotSize.bind(this)),
        takeWhile(this.gameIsNotOver, true),
      );
  }
}
