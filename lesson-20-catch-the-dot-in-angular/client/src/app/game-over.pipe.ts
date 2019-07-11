import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'gameOver'
})
export class GameOverPipe implements PipeTransform {

  transform(score: number) {
    return score === -1 ? 'Game Over' : score;
  }
}
