import fastdom from 'fastdom';
import {interval} from 'rxjs';
import {map, scan, tap, timestamp} from 'rxjs/operators';

const SYMBOLS = '0123456789あいうえおかきくけこがぎぐげごさしすせそざじずぜぞたちつてとだぢづでどなにぬねのはひふへほばびぶべぼぱぴぷぺぽまみむめもや1ゆよらりるれろわゐゑをアイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヰヱヲ읽고압록강독립관념혁신적해빛벗꽃못읽다한나산규률력량로동원쑤라지오우안해꾸바페되였다고마와할가요곽밥동무'.split('');
const symbolsLength = SYMBOLS.length;

function randomIndex(length, minimum = 0) {
  const random = Math.floor(Math.random() * length);
  return random > minimum ? random : minimum;
}

function getRandomElement() {
  return SYMBOLS[randomIndex(symbolsLength)];
}

function createCell(symbol) {
  const element = document.createElement('div');
  element.classList.add('cell');
  element.innerText = symbol;
  return element;
}

const CELL_SIZE = 20;
const INTERVAL = 250;
const MAX_LENGTH = 40;
const MIN_LENGTH = 15;
// 10% of the number of columns
const NEW_DROPS_PER_INTERVAL = 0.1;

window.addEventListener('load', () => {
  const rainElement = document.getElementById('rain');
  const windowHeight = window.innerHeight;
  const windowWidth = window.innerWidth;
  const numberOfColumns = Math.floor(windowWidth / CELL_SIZE);
  const numberOfRows = Math.floor(windowHeight / CELL_SIZE) + 2;
  const numberOfCells = numberOfColumns * numberOfRows;
  const newDropsPerInterval = Math.ceil(numberOfColumns * NEW_DROPS_PER_INTERVAL);
  rainElement.style.gridTemplateRows = `repeat(${numberOfRows}, ${CELL_SIZE}px)`;

  const cellElements = Array.from({length: numberOfCells}, () => createCell(getRandomElement()));
  cellElements.forEach((element) => rainElement.appendChild(element));

  function getRandomInterval() {
    return Math.floor(randomIndex(500) / 16) * 16;
  }

  const initialState = {
    lastIntervalUpdateTimestamp: Date.now(),
    cells: {},
  };
  for (let i = 0; i < numberOfCells; i++) {
    initialState.cells[i] = {
      element: cellElements[i],
      interval: getRandomInterval(),
      isOccupied: false,
    };
  }

  function getNewSymbolsAndIntervals() {
    const result = {};
    for (let c = 0; c < numberOfCells; c++) {
      result[c] = {
        interval: getRandomInterval(),
        symbol: getRandomElement(),
      };
    }
    return result;
  }

  function updateState(state, current) {
    const updatedState = {...state};
    if (current.timestamp - updatedState.lastIntervalUpdateTimestamp < 5000) {
      for (let c = 0; c < numberOfCells; c++) {
        const cell = updatedState.cells[c];
        if (current.value.interval % cell.interval === 0) {
          // cell.element.firstChild.replaceData(0, 1, current.value.data[c].symbol);
          requestAnimationFrame(() => cell.element.firstChild.replaceData(0, 1, current.value.data[c].symbol))
        }
      }
    } else {
      for (let c = 0; c < numberOfCells; c++) {
        const cell = updatedState.cells[c];
        if (current.value.interval % cell.interval === 0) {
          // cell.element.firstChild.replaceData(0, 1, current.value.data[c].symbol);
          requestAnimationFrame(() => cell.element.firstChild.replaceData(0, 1, current.value.data[c].symbol))

        }
        updatedState.cells[c].interval = current.value.data[c].interval;
      }
      updatedState.lastIntervalUpdateTimestamp = current.timestamp;
    }
    return updatedState;
  }

  interval(16).pipe(
    map((i) => ({
      interval: i * 16,
      data: getNewSymbolsAndIntervals(),
    })),
    timestamp(),
    scan(updateState, initialState),
  ).subscribe();

  function getColumnIndexes() {
    const result = [];
    for (let i = 0; i < newDropsPerInterval; i++) {
      const random = randomIndex(numberOfColumns) * numberOfRows;
      if (!result.includes(random)) {
        result.push(random);
      }
    }
    return result;
  }

  function getRowIndexes(number) {
    const result = [];
    for (let i = 0; i < number; i++) {
      result.push(randomIndex(numberOfRows));
    }
    return result;
  }

  function getRandomLengths(number) {
    const result = [];
    for (let i = 0; i < number; i++) {
      result.push(randomIndex(MAX_LENGTH, MIN_LENGTH));
    }
    return result;
  }

  function getDropRanges(columnIndexes, rowIndexes, lengths) {
    const result = [];
    for (let i = 0, length = columnIndexes.length; i < length; i++) {
      const columnIndex = columnIndexes[i];
      const start = columnIndex + rowIndexes[i];
      const end = start + lengths[i];
      const maxEnd = columnIndex + numberOfRows;
      result.push([start, end < maxEnd ? end : maxEnd])
    }
    return result;
  }

  async function playInitialAnimation(cellElement, order) {
    cellElement.animate([
      {color: 'transparent'},
      {color: 'white', offset: 0.2},
      {color: 'green'},
    ], {
      delay: order * 150,
      duration: 500,
    }).onfinish = () => {
      fastdom.mutate(() => cellElement.style.color = '#00ab00');
      cellElement.animate([
        {color: 'green'},
        {color: 'transparent'},
      ], {
        delay: order * 200,
        duration: 500,
      }).onfinish = () => {
        fastdom.mutate(() => cellElement.style.color = 'transparent');
      };
    };
  }

  function animateCells(cellElements) {
    for (let k = 0, length = cellElements.length; k < length; k++) {
      playInitialAnimation(cellElements[k], k);
    }
  }

  async function animateDrops(ranges) {
    for (let i = 0, length = ranges.length; i < length; i++) {
      const range = ranges[i];
      animateCells(cellElements.slice(range[0], range[1]))
    }
  }

  function makeDrops() {
    const columnIndexes = getColumnIndexes();
    const rowIndexes = getRowIndexes(columnIndexes.length);
    const lengths = getRandomLengths(columnIndexes.length);
    const dropRanges = getDropRanges(columnIndexes, rowIndexes, lengths);
    animateDrops(dropRanges);
  }

  interval(INTERVAL).pipe(
    tap(() => makeDrops()),
  ).subscribe();
});


