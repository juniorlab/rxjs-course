import {AfterViewInit, Component} from '@angular/core';
import {fromEvent, Observable, TimeInterval} from 'rxjs';
import {scan, timeInterval} from 'rxjs/operators';

interface TemporaryState {
  interval: number;
  score: number;
  threshold: number;
}

interface State extends TemporaryState {
  record: number;
  fastestClick: number;
}


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements AfterViewInit {
  clicks$: Observable<State>;
  fastestClick = Infinity;
  record = 0;

  initialTemporaryState: TemporaryState = {
    interval: 0,
    score: 0,
    threshold: 300,
  };

  initialState: State = {
    record: 0,
    fastestClick: Infinity,
    ...this.initialTemporaryState,
  };

  ngAfterViewInit() {
    this.clicks$ = fromEvent(document, 'click')
      .pipe(
        timeInterval(),
        scan<TimeInterval<MouseEvent>, State>((state, timeInterval) => {
          return this.updateState(state, timeInterval, this.initialTemporaryState);
        }, this.initialState),
      );
  }

  private convertPercentageToDecimal(score: number) {
    if (score >= 100) {
      return 1;
    }
    return (score / 100).toFixed(2);
  }

  private getMainColor(score: number) {
    if (!score) {
      return `rgba(255, 69, 0, 0)`;
    }
    return `rgba(255, 69, 0, ${this.convertPercentageToDecimal(score)})`;
  }

  private updateState(
    state: State,
    timeInterval: TimeInterval<MouseEvent>,
    initialTemporaryState: TemporaryState) {
    const interval = timeInterval.interval;

    if (interval > state.threshold) {
      // reset temporary state
      return {
        ...state,
        ...initialTemporaryState,
      };
    }

    const score = state.score + 1;

    // update temporary and persistent state
    return {
      interval,
      score,
      fastestClick: state.fastestClick < interval
        ? state.fastestClick
        : interval,
      record: state.record > score
        ? state.record
        : score,
      threshold: state.threshold - 2,
    };
  }
}
