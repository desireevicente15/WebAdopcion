import { TestBed } from '@angular/core/testing';

import { EdadUtilsTsService } from './edad-utils.ts.service';

describe('EdadUtilsTsService', () => {
  let service: EdadUtilsTsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EdadUtilsTsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
