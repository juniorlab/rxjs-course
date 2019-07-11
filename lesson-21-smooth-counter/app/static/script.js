import {fromEvent, interval} from 'rxjs'
import {map, tap, scan, switchMap, takeWhile, finalize} from 'rxjs/operators'

function increment(number, step) {
    return number + step;
}

function decrement(number, step) {
    return number - step;
}

function incrementOrDecrement(endRange, currentValue) {
    return endRange > currentValue ? increment : decrement;
}

function setInnerText(element, text) {
    element.innerText = text;
}

function isNotNearEndRange(endRange, currentValue, step) {
    let distance = endRange - currentValue;
    if (distance < 0) {
        distance = distance * -1;
    }
    return step - distance <= 0;
}

function updateCurrentValue(endRange, currentValue, step) {
    return incrementOrDecrement(endRange, currentValue)(currentValue, step)
}

function getInitialState(inputValue, displayInnerText) {
    const endRange = parseInt(inputValue, 10);
    const currentValue = parseInt(displayInnerText, 10);
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

function updateState(state) {
    return {
        ...state,
        currentValue: updateCurrentValue(state.endRange, state.currentValue, state.step)
    }
}

window.addEventListener('load', () => {
    const input = document.getElementById('rangeInput');
    const display = document.getElementById('display');

    fromEvent(document.getElementById('updateButton'), 'click')
        .pipe(
            map((_) => getInitialState(input.value, display.innerText)),
            switchMap((state) => interval(1).pipe(
                scan(updateState, state),
                tap((state) =>
                    setInnerText(display, state.currentValue)),
                takeWhile((state) =>
                    isNotNearEndRange(state.endRange, state.currentValue, state.step)),
                finalize(() =>
                    setInnerText(display, state.endRange)),
            )),
        )
        .subscribe();
});

