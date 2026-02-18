import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModeOfStudyComponent } from './mode-of-study.component';

describe('ModeOfStudyComponent', () => {
  let component: ModeOfStudyComponent;
  let fixture: ComponentFixture<ModeOfStudyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ModeOfStudyComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModeOfStudyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
