import {HttpClient} from '@angular/common/http';
import {AfterViewInit, Component, ElementRef, OnDestroy, ViewChild} from '@angular/core';
import {fromEvent, Observable, of, Subscription} from 'rxjs';
import {debounceTime, distinctUntilChanged, map, switchMap} from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements AfterViewInit, OnDestroy {
  @ViewChild('typeAhead', {static: false}) input: ElementRef;
  subscription: Subscription;
  countries$: Observable<string[]>;
  constructor(private readonly http: HttpClient) {
  }

  ngAfterViewInit() {
    this.countries$ = fromEvent(this.input.nativeElement, 'keyup')
      .pipe(
        debounceTime(200),
        map((e: Event) => (e.target as HTMLInputElement).value),
        distinctUntilChanged(),
        switchMap((query) => this.getCountries(query)),
      );
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  getCountries(query: string) {
    if (query === '') {
      return of([]);
    }
    return this.http.get<string[]>(`/api/countries?query=${query}`);
  }
}
