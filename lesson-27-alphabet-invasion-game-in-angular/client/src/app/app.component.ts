import {animate, style, transition, trigger} from '@angular/animations';
import {AfterViewInit, ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {scan} from 'rxjs/operators';
import {AppService} from './app.service';
import {Key, Letter, State} from './app.types';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
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
export class AppComponent implements OnInit, AfterViewInit {

  @ViewChild('lettersField', {static: false}) lettersField: ElementRef;

  letters: Letter[] = [];

  constructor(
    private service: AppService,
    private cdref: ChangeDetectorRef,
  ) {
  }

  private updateState(
    state: State,
    [letter, key, gameOver]: [Letter, Key, boolean]) {
    if (letter.timestamp > key.timestamp) {
      return {
        ...state,
        gameOver,
        letters: state.letters.concat([letter]),
      };
    }

    const updatedState = {...state, gameOver};

    if (updatedState.letters[0].value === key.value) {
      this.service.intersectionObserver.unobserve(this.lettersField.nativeElement.children[0]);
      this.letters = this.letters.slice(1)
    }
  }

  ngOnInit() {
    this.service.randomLetters$.subscribe({
      next: (letter: Letter) => {
        this.letters = this.letters.concat([letter]);
      },
    });
  }

  ngAfterViewInit() {
    this.service.intersectionObserver =
      new IntersectionObserver(this.service.onThresholdCross.bind(this.service), {
        root: this.lettersField.nativeElement,
        rootMargin: '0px 20px 0px 20px',
        threshold: 0.99,
      });

    this.service.randomLetters$
      .subscribe({
      next: (letter: Letter) => {
        this.letters = this.letters.concat([letter]);
        // this.cdref.markForCheck();
        // console.log(this.getLastChild(this.lettersField.nativeElement))
        const letterElement = this.getLastChild(this.lettersField.nativeElement);
        if (letterElement) {
          this.service.intersectionObserver.observe(letterElement);
        }
      },
    });

    this.service.game$
      .pipe(
        scan(this.updateState.bind(this), this.service.initialState),
      );
  }

  private getLetterTransformStyle(xCoordinate: number) {
    return `translate(${xCoordinate * 5}px, 408px)`;
  }

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

  getLastChild(element: Element) {
    return Array.from(element.children).slice(-1)[0]
  }
}

