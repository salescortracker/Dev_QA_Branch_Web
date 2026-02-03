import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeresginationdetailsComponent } from './employeeresginationdetails.component';

describe('EmployeeresginationdetailsComponent', () => {
  let component: EmployeeresginationdetailsComponent;
  let fixture: ComponentFixture<EmployeeresginationdetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EmployeeresginationdetailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmployeeresginationdetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
