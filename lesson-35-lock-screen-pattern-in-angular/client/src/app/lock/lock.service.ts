import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LockService {

  constructor() { }

  range(length) {
    return Array.from({length}, (_, i) => i)
  }
}
