import {BehaviorSubject, combineLatest, fromEvent, interval, Subject} from 'rxjs';
import {finalize, map, multicast, refCount, scan, startWith, switchMap, takeWhile, tap} from 'rxjs/operators';

function setInnerText(element, text) {
  element.innerText = text;
}

function setStyle(element, rule, value) {
  element.style[rule] = value;
}


const createPadObject = (id, rectangle) => ({
  id,
  left: rectangle.left,
  right: rectangle.right,
  top: rectangle.top,
  bottom: rectangle.bottom
});

window.addEventListener('load', () => {
  const resultElement = document.getElementById('result');
  const cellElements = Array.from(document.getElementsByClassName('cell'));
  const expectedPasswordElement = document.getElementById('expectedPassword');

  function colorPasswordPads(color) {
      cellElements.forEach((cell) => setStyle(cell, 'background', color))
  }

  function getPad(id) {
    return cellElements[id - 1];
  }

  const pads = Array.from({length: 9}, (_, i) => i + 1)
    .map((id) => createPadObject(id, getPad(id).getBoundingClientRect()));

  function markTouchedPad (id) {
    const pad = getPad(id);
    setStyle(pad, 'background', 'lightgrey');
    pad.animate([
      {transform: 'scale(0.9)'},
      {transform: 'scale(1)'},
    ], {
      duration: 300,
      iterations: 1,
    })
  }

  function setResult(result) {
    colorPasswordPads(result ? 'MediumSeaGreen' : 'IndianRed');
    setInnerText(resultElement, result ? 'It\'s a match' : 'Does not match')
  }

  function displaySelectedNumbers(id) {
    resultElement.textContent += id;
  }

  function resetPasswordPad() {
    setInnerText(resultElement, '');
    colorPasswordPads('gray')
  }

  const sub = new Subject();
  const expectedPasswordUpdate$ = fromEvent(expectedPasswordElement, 'keyup')
    .pipe(
      map((event) => event.target.value),
      tap((value) => sub.next(value.split('').map((num) => parseInt(num, 10))))
    );
  let expectedPassword = [1, 2, 5, 5];
  const expectedPassword$ = sub.pipe(
    tap((sequence) => expectedPassword = sequence),
  )

  const takeMouseSwipe = pipe()
});

