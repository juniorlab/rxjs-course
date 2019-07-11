import {AfterViewInit, Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {of, Subject} from "rxjs";
import {map, startWith, tap} from "rxjs/operators";

interface State {
  endRange: number;
  currentValue: number;
  step: number;
}

@Component({
  selector: 'app-counter',
  templateUrl: './counter.component.html',
  styleUrls: ['./counter.component.css']
})
export class CounterComponent implements AfterViewInit {

  constructor() {
  }

  clicks$ = new Subject<string>();
  states$ = this.clicks$
    .pipe(
      tap(value => console.log('current value', value)),
      map(value => parseInt(value, 10) * 2)
    );

  initialState: State = {
    endRange: 0,
    currentValue: 0,
    step: 0,
  };

  ngAfterViewInit() {
  }
}
