import { TestBed } from '@angular/core/testing';

import { DatasyncService } from './datasync.service';

describe('DatasyncService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: DatasyncService = TestBed.get(DatasyncService);
    expect(service).toBeTruthy();
  });
});
