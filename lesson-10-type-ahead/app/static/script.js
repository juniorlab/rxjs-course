import {fromEvent, from, of} from 'rxjs';
import {debounceTime, map, distinctUntilChanged, switchMap} from 'rxjs/operators'


function getCountries(query) {
  if (query === '') {
    return of({json: () => []});
  }
  return from(fetch(`/api/countries?query=${query}`))
}

window.addEventListener('load', () => {
  const output = document.getElementById('output');

  fromEvent(document.getElementById('typeAhead'), 'keyup')
    .pipe(
      debounceTime(200),
      map((e) => e.target.value),
      distinctUntilChanged(),
      switchMap((query) => getCountries(query)),
    )
    .subscribe(
      async (countries) => {
        output.innerText = (await countries.json()).join('\n')
      }
    );
});
