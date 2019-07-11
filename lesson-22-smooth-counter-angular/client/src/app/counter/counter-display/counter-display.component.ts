import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {State} from '../counter.types';

@Component({
  selector: 'app-counter-display',
  templateUrl: './counter-display.component.html',
  styleUrls: ['./counter-display.component.css']
})
export class CounterDisplayComponent implements OnInit {

  @Input() displayValue: number;
  @Output() update = new EventEmitter<State>();

  constructor() { }

  ngOnInit() {
  }

  private getInitialState(rawEndRange: string, rawCurrentValue: string): State {
    const endRange = parseInt(rawEndRange, 10);
    const currentValue = parseInt(rawCurrentValue, 10);
    let distance = endRange - currentValue;
    if (distance < 0) {
      distance = distance * -1;
    }

    return {
      endRange,
      currentValue,
      step: Math.ceil(distance / 1000) * 8
    }
  }

  emit(endRange: string, currentValue: string) {
    console.log(this.getInitialState(endRange, currentValue))
    this.update.emit(this.getInitialState(endRange, currentValue));
  }
}
