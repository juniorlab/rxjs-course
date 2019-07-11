import {Component} from '@angular/core';
import {interval, Observable, Subject} from 'rxjs';
import {finalize, scan, startWith, switchMap, takeWhile, tap} from 'rxjs/operators';
import {State} from './counter.types';

@Component({
  selector: 'app-counter',
  templateUrl: './counter.component.html',
  styleUrls: ['./counter.component.css'],
})
export class CounterComponent {

  constructor() {
  }

  initialState: State = {
    endRange: 0,
    currentValue: 0,
    step: 8,
  };

  clicks$ = new Subject<State>();
  states$: Observable<State> = this.clicks$
    .pipe(
      startWith(this.initialState),
      switchMap((state: State) => interval(1)
        .pipe(
          scan((state: State, tick: number) => this.updateState(state, tick), state),
          takeWhile((state) =>
            this.isNotNearEndRange(state.endRange, state.currentValue, state.step), true),
          finalize(() => {
            this.setCurrentValueToEndRange(state);
          }),
        )),
    );

  private increment(number: number, step: number) {
    return number + step;
  }

  private decrement(number: number, step: number) {
    return number - step;
  }

  private incrementOrDecrement(endRange: number, currentValue: number) {
    return endRange > currentValue ? this.increment : this.decrement;
  }

  private updateCurrentValue(endRange: number, currentValue: number, step: number) {
    return this.incrementOrDecrement(endRange, currentValue)(currentValue, step);
  }

  private updateState(state: State, _: number): State {
    // console.log(state)
    return {
      ...state,
      currentValue: this.updateCurrentValue(state.endRange, state.currentValue, state.step),
    };
  }

  private isNotNearEndRange(endRange: number, currentValue: number, step: number) {
    let distance = endRange - currentValue;
    if (distance < 0) {
      distance = distance * -1;
    }
    return step - distance <= 0;
  }

  private setCurrentValueToEndRange(state: State) {
    if (state.currentValue !== state.endRange) {
      this.clicks$.next({
        ...state,
        currentValue: state.endRange,
      });
    }
  }
}
