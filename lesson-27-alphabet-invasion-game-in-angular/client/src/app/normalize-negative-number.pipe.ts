import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'normalizeNegativeNumber'
})
export class NormalizeNegativeNumberPipe implements PipeTransform {

  transform(value: number): number {
    return value < 0 ? 0: value;
  }
}
