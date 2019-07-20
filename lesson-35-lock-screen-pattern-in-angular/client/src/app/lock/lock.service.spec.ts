import { TestBed } from '@angular/core/testing';

import { LockService } from './lock.service';

describe('LockService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: LockService = TestBed.get(LockService);
    expect(service).toBeTruthy();
  });
});
