import {DOCUMENT} from '@angular/common';
import {Component, Inject, Input, OnInit} from '@angular/core';
import {fromEvent, of, Subject} from 'rxjs';
import {distinct, mergeMap, startWith, switchMap, takeUntil, toArray} from 'rxjs/operators';
import {LockService} from './lock.service';

@Component({
  selector: 'app-lock',
  templateUrl: './lock.component.html',
  styleUrls: ['./lock.component.css']
})
export class LockComponent implements OnInit {

  @Input() private storedSequence: string;

  mouseEnterEvents$ = new Subject<number>();
  mouseDownEvents$ = new Subject<number>();
  mouseUpEvents$ = fromEvent(this.document, 'mouseup');
  patternInput$ = this.mouseDownEvents$
    .pipe(
      switchMap((mouseDownEvent) => this.mouseEnterEvents$
        .pipe(
          startWith(mouseDownEvent),
          distinct()
        )),
      takeUntil(this.mouseUpEvents$),
      toArray(),
      mergeMap((sequence) => of(sequence.join('') === this.storedSequence))
    );

  constructor(
    @Inject(DOCUMENT) private document: Document,
    private lockService: LockService,
  ) {}

  ngOnInit() {
    this.subscribe()
  }

  noop() {
    return false;
  }

  onPasswordInput(isCorrect: boolean) {
    if (isCorrect) {
      location.assign('https://rxjs-dev.firebaseapp.com')
    } else {
      this.subscribe()
    }
  }

  subscribe() {
    this.patternInput$.subscribe(this.onPasswordInput.bind(this))
  }
}
