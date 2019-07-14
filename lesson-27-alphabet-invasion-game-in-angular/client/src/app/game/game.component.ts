import {animate, style, transition, trigger} from '@angular/animations';
import {Component, ElementRef, EventEmitter, Input, Output, ViewChild} from '@angular/core';
import {Letter, State} from '../app.types';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css'],
  animations: [
    trigger('letterEnterLeaveTrigger', [
      transition(':enter', [
        style({
          transform: 'translate({{x}}, 0px)',
        }),
        animate('{{timings}}', style({
          transform: 'translate({{x}}, 408px)',
        })),
      ], {
        params: {
          timings: '1s',
          x: '0px',
        },
      }),
    ]),
  ],
})
export class GameComponent{
  @Output() start = new EventEmitter();
  @Input() game: State;
  @ViewChild('lettersField', {static: false}) lettersField: ElementRef;

  private getLetterEnterTriggerParams(letter: Letter) {
    return {
      value: ':enter',
      params: {
        timings: `${letter.interval * 20}ms`,
        x: `${letter.xCoordinate * 5}px`,
      },
    };
  }

  lettersTrackBy(index: number, letter: Letter) {
    return letter.timestamp;
  }

  private getLetterTransformStyle(xCoordinate: number) {
    return `translate(${xCoordinate * 5}px, 408px)`;
  }
}
