import { Component, OnInit } from '@angular/core';
import { ShiftMasterDto } from '../../servies/admin.service';
import { AdminService } from '../../servies/admin.service';
import Swal from 'sweetalert2';


@Component({
  selector: 'app-attendance-setting',
  standalone: false,
  templateUrl: './attendance-setting.component.html',
  styleUrl: './attendance-setting.component.css'
})
export class AttendanceSettingComponent implements OnInit {

  searchText = '';
  pageSize = 5;
  currentPage = 1;
  isEditMode = false;

  settings: ShiftMasterDto[] = [];

  newSetting: ShiftMasterDto = {
  shiftID: 0,
  shiftName: '',
  shiftStartTime: '',
  shiftEndTime: '',
  graceTime: 0,
  overtimeAllowed: false,
  isActive: true
};

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.loadShifts();
  }
   // ✅ ADD THIS METHOD (THIS WAS MISSING)
  private normalizeBoolean(value: any): boolean {
    return value === true || value === 1 || value === '1' || value === 'true';
  }

loadShifts() {
  this.adminService.getAllShifts().subscribe(res => {
    this.settings = res.map(s => ({
      ...s,
      shiftStartTime: s.shiftStartTime?.substring(0, 5),
      shiftEndTime: s.shiftEndTime?.substring(0, 5),
      overtimeAllowed: this.normalizeBoolean((s as any).overtimeAllowed),
      isActive: this.normalizeBoolean((s as any).isActive)
    }));
  });
}

aaddOrUpdateSetting() {
  const action$ = this.isEditMode
    ? this.adminService.updateShift(this.newSetting)
    : this.adminService.addShift(this.newSetting);

  action$.subscribe({
    next: () => {
      Swal.fire({
        icon: 'success',
        title: this.isEditMode ? 'Updated!' : 'Saved!',
        text: this.isEditMode
          ? 'Shift updated successfully'
          : 'Shift added successfully',
        timer: 1200,
        showConfirmButton: false
      }).then(() => {
        this.loadShifts();
      });
    },
    error: () => {
      Swal.fire('Error', 'Something went wrong', 'error');
    }
  });
}



  // EDIT
editSetting(s: ShiftMasterDto) {
  this.newSetting = {
    ...s,
    shiftStartTime: s.shiftStartTime?.substring(0, 5),
    shiftEndTime: s.shiftEndTime?.substring(0, 5),
    overtimeAllowed: this.normalizeBoolean((s as any).overtimeAllowed),
    isActive: this.normalizeBoolean((s as any).isActive)
  };
  this.isEditMode = true;
  this.loadShifts();
}

deleteSetting(setting: ShiftMasterDto) {
  Swal.fire({
    title: 'Are you sure?',
    text: `Delete shift "${setting.shiftName}"?`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#6c757d',
    confirmButtonText: 'Yes, delete it'
  }).then((result) => {
    if (result.isConfirmed) {
      this.adminService.deleteShift(setting.shiftID).subscribe(() => {
        Swal.fire({
          icon: 'success',
          title: 'Deleted!',
          text: 'Shift deleted successfully',
          timer: 1500,
          showConfirmButton: false
        });
        this.loadShifts();
      });
    }
  });
}

 resetForm() {
  this.newSetting = {
    shiftID: 0,
    shiftName: '',
    shiftStartTime: '09:00',
    shiftEndTime: '18:00',
    overtimeAllowed: false,
    graceTime: 0,
    isActive: true
  };
  this.isEditMode = false;

  Swal.fire({
    icon: 'info',
    title: 'Form Reset',
    timer: 1000,
    showConfirmButton: false
  });
}


  // SEARCH + PAGINATION
  filteredSettings() {
    return this.settings.filter(s =>
      s.shiftName.toLowerCase().includes(this.searchText.toLowerCase())
    );
  }

  totalPages() {
    return Math.ceil(this.filteredSettings().length / this.pageSize);
  }

  pagesArray() {
    return Array.from({ length: this.totalPages() }, (_, i) => i + 1);
  }

  paginatedSettings() {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredSettings().slice(start, start + this.pageSize);
  }

  changePage(page: number) {
    if (page < 1 || page > this.totalPages()) return;
    this.currentPage = page;
  }
}
