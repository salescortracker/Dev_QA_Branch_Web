import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AdminService } from '../../servies/admin.service';
@Component({
  selector: 'app-welcomedemo',
  standalone: false,
  templateUrl: './welcomedemo.component.html',
  styleUrl: './welcomedemo.component.css'
})
export class WelcomedemoComponent {
 demoForm!: FormGroup;

  constructor(private fb: FormBuilder,private demoService: AdminService) {}

  ngOnInit(): void {
    this.demoForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      company: [''],
      module: ['']
    });
  }

  submit() {
  if (this.demoForm.invalid) {
    this.demoForm.markAllAsTouched();
    return;
  }

  this.demoService.submitDemoRequest(this.demoForm.value)
    .subscribe({
      next: () => {
        alert('Demo request submitted successfully!');
        this.demoForm.reset();
      },
      error: () => {
        alert('Failed to submit demo request');
      }
    });
}
}
