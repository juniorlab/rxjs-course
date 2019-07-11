import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';

@Component({
  selector: 'app-counter-display',
  templateUrl: './counter-display.component.html',
  styleUrls: ['./counter-display.component.css']
})
export class CounterDisplayComponent implements OnInit {

  @Input() displayValue: string;
  @Output() update = new EventEmitter<string>();

  constructor() { }

  ngOnInit() {
  }

}
