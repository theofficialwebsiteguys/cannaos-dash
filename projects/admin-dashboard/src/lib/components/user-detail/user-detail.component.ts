import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { AdminService } from '../../services/admin.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'lib-user-detail',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatTableModule, MatCardModule, ReactiveFormsModule, FormsModule, MatSortModule, MatProgressSpinnerModule ],
  templateUrl: './user-detail.component.html',
  styleUrl: './user-detail.component.scss'
})
export class UserDetailComponent {
  @ViewChild(MatSort) sort!: MatSort;
  @Input() user: any;
  @Output() closeDetail = new EventEmitter<void>();
  @Output() orderSelected = new EventEmitter<any>(); // Emits the selected order
  userOrdersData = new MatTableDataSource<any>();

  editMode = false;
  editablePoints!: number;
  editableRole!: string;
  editableFname!: string;
  editableLname!: string;
  editableEmail!: string;
  editablePhone!: string;
  editableCountry!: string;

  saving = false;

  constructor(private adminService: AdminService){}

  ngOnChanges() {
    if (this.user && this.user.orders) {
      this.userOrdersData.data = this.user.orders;
  
      if (this.sort) {
        this.userOrdersData.sort = this.sort;
      }
    }
  }
  
  ngAfterViewInit() {
    if (this.sort) {
      this.userOrdersData.sort = this.sort;
    }
  }
  
  

  close() {
    this.closeDetail.emit();
  }

  selectOrder(order: any) {
    this.orderSelected.emit(order); // Emit the selected order to the parent
  }

  toggleEditMode() {
    this.editMode = true;
    this.editableFname = this.user.fname;
    this.editableLname = this.user.lname;
    this.editableEmail = this.user.email;
    this.editablePhone = this.user.phone;
    this.editableCountry = this.user.country;
    this.editablePoints = this.user.points;
    this.editableRole = this.user.role;
  }


  cancelEdit() {
    this.editMode = false;
  }

  saveChanges() {
    this.saving = true;

    const updatedUser = { 
      id: this.user.id, 
      fname: this.editableFname,
      lname: this.editableLname,
      email: this.editableEmail,
      phone: this.editablePhone,
      country: this.editableCountry,
      points: this.editablePoints,
      role: this.editableRole
    };

    this.adminService.updateUser(updatedUser).subscribe({
      next: (response) => {
        Object.assign(this.user, updatedUser);
        this.editMode = false;
        this.saving = false;
      },
      error: (err) => {
        console.error('Error updating user:', err);
        this.saving = false;
      }
    });
  }

  upgradeToPremium() {
    this.adminService.upgradeUserToPremium(this.user.phone, this.user.email).subscribe({
      next: () => {
        this.user.premium = true;
        this.user.premium_start = new Date(); // optional visual feedback
        console.log('User upgraded to premium');
      },
      error: (err) => {
        console.error('Failed to upgrade user:', err);
      }
    });
  }
  
  downgradeFromPremium() {
    this.adminService.downgradeUserFromPremium(this.user.phone, this.user.email).subscribe({
      next: () => {
        this.user.premium = false;
        this.user.premium_start = null;
        this.user.premium_end = null;
        console.log('User downgraded from premium');
      },
      error: (err) => {
        console.error('Failed to downgrade user:', err);
      }
    });
  }
  

}
