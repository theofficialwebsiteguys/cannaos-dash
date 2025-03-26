import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { AdminService } from '../../services/admin.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'lib-user-detail',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatTableModule, MatCardModule, ReactiveFormsModule, FormsModule],
  templateUrl: './user-detail.component.html',
  styleUrl: './user-detail.component.scss'
})
export class UserDetailComponent {
  @Input() user: any;
  @Output() closeDetail = new EventEmitter<void>();
  @Output() orderSelected = new EventEmitter<any>(); // Emits the selected order

  editMode = false;
  editablePoints!: number;
  editableRole!: string;

  constructor(private adminService: AdminService){}

  close() {
    this.closeDetail.emit();
  }

  selectOrder(order: any) {
    this.orderSelected.emit(order); // Emit the selected order to the parent
  }

  toggleEditMode() {
    this.editMode = true;
    this.editablePoints = this.user.points;
    this.editableRole = this.user.role;
  }

  cancelEdit() {
    this.editMode = false;
  }

  saveChanges() {
    const updatedUser = { 
      id: this.user.id, 
      points: this.editablePoints,
      role: this.editableRole
    };

    this.adminService.updateUser(updatedUser).subscribe({
      next: (response) => {
        this.user.points = this.editablePoints; // Update UI
        this.user.role = this.editableRole;
        this.editMode = false;
      },
      error: (err) => {
        console.error('Error updating user:', err);
      }
    });
  }

}
