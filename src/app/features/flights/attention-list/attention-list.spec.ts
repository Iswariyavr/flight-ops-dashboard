import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AttentionList } from './attention-list';

describe('AttentionList', () => {
  let component: AttentionList;
  let fixture: ComponentFixture<AttentionList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AttentionList],
    }).compileComponents();

    fixture = TestBed.createComponent(AttentionList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
