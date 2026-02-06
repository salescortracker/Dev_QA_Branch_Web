import { Component, OnInit } from '@angular/core';
import { ShiftMasterDto, EmployeeResignationService } from '../../employee-profile/employee-services/employee-resignation.service';
import { AdminService, User } from '../../../admin/servies/admin.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-daily-working-hours',
  standalone: false,
  templateUrl: './daily-working-hours.component.html',
  styleUrl: './daily-working-hours.component.css'
})
export class DailyWorkingHoursComponent implements OnInit  {
  form!: FormGroup;

shifts: ShiftMasterDto[] = [];
  users: User[] = [];
  selectedEmployees: string[] = [];
  selectedShift: number | null = null;
  assignedList: any[] = [];
  daysConfig = [
  { day: 'Monday', value: 1, work: 'mondayWorking', start: 'mondayStart', end: 'mondayEnd' },
  { day: 'Tuesday', value: 2, work: 'tuesdayWorking', start: 'tuesdayStart', end: 'tuesdayEnd' }, // ✅ FIXED
  { day: 'Wednesday', value: 3, work: 'wednesdayWorking', start: 'wednesdayStart', end: 'wednesdayEnd' },
  { day: 'Thursday', value: 4, work: 'thursdayWorking', start: 'thursdayStart', end: 'thursdayEnd' },
  { day: 'Friday', value: 5, work: 'fridayWorking', start: 'fridayStart', end: 'fridayEnd' },
  { day: 'Saturday', value: 6, work: 'saturdayWorking', start: 'saturdayStart', end: 'saturdayEnd' },
  { day: 'Sunday', value: 0, work: 'sundayWorking', start: 'sundayStart', end: 'sundayEnd' }
];


  constructor(private adminService: AdminService, private fb: FormBuilder, private shiftSvc: EmployeeResignationService) {}

  ngOnInit(): void {
   this.form = this.fb.group({
  shiftID: ['', Validators.required],

  mondayWorking: [true],
  mondayStart: [''],
  mondayEnd: [''],

  tuesdayWorking: [true],
  tuesdayStart: [''],
  tuesdayEnd: [''],

  wednesdayWorking: [true],
  wednesdayStart: [''],
  wednesdayEnd: [''],

  thursdayWorking: [true],
  thursdayStart: [''],
  thursdayEnd: [''],

  fridayWorking: [true],
  fridayStart: [''],
  fridayEnd: [''],

  saturdayWorking: [false],
  saturdayStart: [''],
  saturdayEnd: [''],

  sundayWorking: [false],
  sundayStart: [''],
  sundayEnd: ['']
});


    // keep `selectedShift` in sync with the reactive form
    this.form.get('shiftID')?.valueChanges.subscribe(id => {
      const shift = this.shifts.find(s => s.shiftID == id);
      if (!shift) return;

      this.form.patchValue({
        mondayStart: shift.shiftStartTime,
        mondayEnd: shift.shiftEndTime,

        tuesdayStart: shift.shiftStartTime,
        tuesdayEnd: shift.shiftEndTime,

        wednesdayStart: shift.shiftStartTime,
        wednesdayEnd: shift.shiftEndTime,

        thursdayStart: shift.shiftStartTime,
        thursdayEnd: shift.shiftEndTime,

        fridayStart: shift.shiftStartTime,
        fridayEnd: shift.shiftEndTime,

        saturdayStart: shift.shiftStartTime,
        saturdayEnd: shift.shiftEndTime,

        sundayStart: shift.shiftStartTime,
        sundayEnd: shift.shiftEndTime
      });
    });
    this.loadShifts();
    this.loadUsers();
      this.loadAssignedList(); // ✅ ADD THIS

  }

  loadShifts() {
    // use the same service/endpoint other working components use
    this.shiftSvc.getAllShifts().subscribe({
      next: (res) =>{
        console.log('Shifts loaded:', res);
        this.shifts = res || [];
      },
      error: (err) => console.error('Error loading shifts:', err)
    });
  }

  loadUsers() {
    this.adminService.getAllUsers().subscribe({
      next: (res) => this.users = res,
      error: (err) => console.error('Error loading users:', err)
    });
  }

  toggleEmployeeSelection(empCode: string, event: any) {
    if (event.target.checked) {
      this.selectedEmployees.push(empCode);
    } else {
      this.selectedEmployees = this.selectedEmployees.filter(e => e !== empCode);
    }
  }

  toggleSelectAll(event: any) {
    if (event.target.checked) {
      this.selectedEmployees = this.users.map(u => u.employeeCode);
    } else {
      this.selectedEmployees = [];
    }
  }

onSubmit() {
  if (this.form.invalid || this.selectedEmployees.length === 0) {
    return;
  }

  const payload: any[] = [];
const shiftId = Number(this.form.value.shiftID);
const companyId = Number(sessionStorage.getItem('CompanyId'));
const regionId = Number(sessionStorage.getItem('RegionId'));

  this.selectedEmployees.forEach(empCode => {
    this.daysConfig.forEach(d => {

      if (this.form.value[d.work]) {
this.form.value['tuesdayWorking'] // true / false
        const end = this.form.value[d.end];

        payload.push({
          employeeCode: empCode,
          shiftId: shiftId,
          dayOfWeek: d.value,
          isWorking: true,
          startTime: this.form.value[d.start],
          endTime: end,
          totalHours: this.calculateTotalHours(this.form.value[d.start], end),
          companyId: companyId,
          regionId: regionId
        });
      }
    });
  });

  this.adminService.saveDailyWorkingHours(payload).subscribe({
    next: () => {
      alert('Saved Successfully');
      this.loadAssignedList();
    },
    error: err => console.error(err)
  });
}


  calculateTotalHours(startTime: string, endTime: string): number {
    if (!startTime || !endTime) return 0; 

    const start = new Date(`1970-01-01T${startTime}`);
    const end = new Date(`1970-01-01T${endTime}`);

    const diffInMs = end.getTime() - start.getTime();
    const diffInHours = diffInMs / (1000 * 60 * 60);

    return Math.abs(diffInHours);
  }

  
  loadAssignedList() {
  this.adminService.getDailyWorkingHours().subscribe({
    next: res => {
      console.log('Assigned List:', res);
      this.assignedList = res;
    },
    error: err => console.error('GET failed', err)
  });
}
updateRow(row: any) {
  this.adminService.updateDailyWorkingHour(row.dailyWorkingHourId, row)
    .subscribe({
      next: () => {
        alert('Updated Successfully');
        this.loadAssignedList();
      },
      error: err => console.error(err)
    });
}


deleteRow(id: number) {
  if (!confirm('Are you sure you want to delete?')) return;

  this.adminService.deleteDailyWorkingHour(id).subscribe({
    next: () => {
      alert('Deleted Successfully');
      this.loadAssignedList();
    },
    error: err => console.error(err)
  });
}


}