import { TestBed } from '@angular/core/testing';

import { Lastfm } from './lastfm';

describe('Lastfm', () => {
  let service: Lastfm;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Lastfm);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
