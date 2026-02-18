import { Component } from '@angular/core';
import { AdminService } from '../admin/servies/admin.service';
import { NgxSpinnerService } from 'ngx-spinner';
import Swal from 'sweetalert2';



export interface ModeOfStudy {
  
  modeOfStudyId: number;
  modeName: string;
  companyId: number;
  regionId: number;
  isActive: boolean;
   companyName?: string;
  regionName?: string;
  userId: number;
}
@Component({
  selector: 'app-mode-of-study',
  standalone: false,
  templateUrl: './mode-of-study.component.html',
  styleUrl: './mode-of-study.component.css'
})
export class ModeOfStudyComponent {

  modes: ModeOfStudy[] = [];
  mode: ModeOfStudy = this.getEmptyMode();

  companies: any[] = [];
  regions: any[] = [];

  companyMap: { [key: number]: string } = {};
  regionMap: { [key: number]: string } = {};

  showUploadPopup = false;
  isEditMode = false;
  userId: number = Number(sessionStorage.getItem('UserId'));

  searchText = '';
  statusFilter: boolean | '' = '';

  pageSize = 5;
  currentPage = 1;

  companyId: number = Number(sessionStorage.getItem('CompanyId'));
  regionId: number = Number(sessionStorage.getItem('RegionId'));

  modeModel: any = {
    modeName: 'Online',
    isActive: true
  };

  constructor(
    private adminService: AdminService,
    private spinner: NgxSpinnerService
  ) {}

  ngOnInit(): void {
    this.loadCompanies();
    this.loadRegions();
    this.loadModes();
  }

  // ================= EMPTY MODEL =================
  getEmptyMode(): ModeOfStudy {
    return {
      modeOfStudyId: 0,
      modeName: '',
      companyId: 0,
      regionId: 0,
      userId: Number(sessionStorage.getItem('UserId')),
      isActive: true
    };
  }

  // ================= LOAD DATA =================
  loadModes(): void {
  this.spinner.show();

  this.adminService.getAllModeOfStudy(this.userId)
    .subscribe({
      next: (res: any) => {

        console.log("API Response:", res);

        this.modes = (res || []).map((m: ModeOfStudy) => ({
          ...m,
        }));

        this.spinner.hide();
      },
      error: (err) => {
        console.error(err);
        this.spinner.hide();
      }
    });
}
  loadCompanies(): void {
    this.adminService.getCompanies().subscribe((res: any[]) => {
      this.companies = res;
      res.forEach(c => this.companyMap[c.companyId] = c.companyName);
    });
  }

  loadRegions(): void {
    this.adminService.getRegions().subscribe((res: any[]) => {
      this.regions = res;
      res.forEach(r => this.regionMap[r.regionID] = r.regionName);
    });
  }

  // ================= CRUD =================
  onSubmit(): void {

  if (!this.mode.modeName || !this.mode.companyId || !this.mode.regionId) {
    Swal.fire('Error', 'Please fill all required fields', 'error');
    return;
  }
  this.mode.userId = this.userId;

  this.spinner.show();

  const request = this.isEditMode
    ? this.adminService.updateModeOfStudy(this.mode)
    : this.adminService.createModeOfStudy(this.mode);

  request.subscribe({
  next: (res: any) => {
    console.log(res); // 👈 check response

    Swal.fire(
      'Success',
      res?.message || 
      (this.isEditMode ? 'Updated successfully' : 'Created successfully'),
      'success'
    );

    this.resetForm();
    // this.loadModes();
    this.spinner.hide();
  },
  error: (err) => {
    console.error('API ERROR:', err);
    Swal.fire('Error', err?.error?.message || 'Something went wrong!', 'error');
    this.spinner.hide();
  }
});
}

  editMode(m: ModeOfStudy): void {
    this.mode = { ...m };
    this.isEditMode = true;
  }

  deleteMode(m: ModeOfStudy): void {
    Swal.fire({
      title: `Delete ${m.modeName}?`,
      showCancelButton: true,
      confirmButtonText: 'Confirm'
    }).then(result => {
      if (result.isConfirmed) {
        this.adminService.deleteModeOfStudy(m.modeOfStudyId)
  .subscribe({
    next: () => {
      Swal.fire('Deleted!', '', 'success');
      this.loadModes();
    },
    error: () => {
      Swal.fire('Error', 'Delete failed', 'error');
    }
  });
      }
    });
  }

  resetForm(): void {
    this.mode = this.getEmptyMode();
    this.isEditMode = false;
  }

  // ================= FILTER =================
  filteredModes(): ModeOfStudy[] {
    return this.modes.filter(m => {
      const matchSearch = m.modeName.toLowerCase()
        .includes(this.searchText.toLowerCase());
      const matchStatus =
        this.statusFilter === '' || m.isActive === this.statusFilter;
      return matchSearch && matchStatus;
    });
  }

  // ================= PAGINATION =================
  get totalPages(): number {
    return Math.ceil(this.filteredModes().length / this.pageSize);
  }

  get pagedModes(): ModeOfStudy[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredModes().slice(start, start + this.pageSize);
  }

  goToPage(page: number): void {
    this.currentPage = page;
  }

  // ================= EXPORT =================
  exportAs(type: 'excel' | 'pdf') {
    if (type === 'excel') this.exportExcel();
    else this.exportPDF();
  }

  exportExcel() {
    const exportData = this.modes.map(m => ({
      'Mode Name': m.modeName,
      'Company': m.companyName,
      'Region': m.regionName,
      'Status': m.isActive ? 'Active' : 'Inactive'
    }));

    // const ws = XLSX.utils.json_to_sheet(exportData);
    // const wb = XLSX.utils.book_new();
    // XLSX.utils.book_append_sheet(wb, ws, 'Modes');
    // XLSX.writeFile(wb, 'ModeOfStudy.xlsx');
  }

  exportPDF() {
    // const doc = new jsPDF();
    // const exportData = this.modes.map(m => [
    //   m.modeName,
    //   m.companyName,
    //   m.regionName,
    //   m.isActive ? 'Active' : 'Inactive'
    // ]);

    // autoTable(doc, {
    //   head: [['Mode Name', 'Company', 'Region', 'Status']],
    //   body: exportData
    // });

    // doc.save('ModeOfStudy.pdf');
  }

  // ================= BULK UPLOAD =================
  openUploadPopup() {
    this.showUploadPopup = true;
  }

  closeUploadPopup() {
    this.showUploadPopup = false;
  }

  onBulkUploadComplete(data: any) {
    if (data && data.length > 0) {
      this.adminService.bulkInsertData('ModeOfStudy', data)
        .subscribe(() => {
          Swal.fire('Success', 'Uploaded successfully!', 'success');
          this.loadModes();
          this.closeUploadPopup();
        });
    }
  }
}
