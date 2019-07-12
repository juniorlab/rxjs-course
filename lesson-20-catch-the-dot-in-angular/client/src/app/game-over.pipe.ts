import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'gameOver'
})
export class GameOverPipe implements PipeTransform {

  transform(remaining: number) {
    return remaining === -1 ? 'Game Over' : remaining;
  }

}
