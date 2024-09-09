import { TestBed } from '@angular/core/testing';

import { EmpanadaService } from './empanada.service';

describe('EmpanadaService', () => {
  let service: EmpanadaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EmpanadaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
