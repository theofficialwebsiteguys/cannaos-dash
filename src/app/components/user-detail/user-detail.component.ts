import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';

@Component({
  selector: 'app-user-detail',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatTableModule, MatCardModule],
  templateUrl: './user-detail.component.html',
  styleUrl: './user-detail.component.scss'
})
export class UserDetailComponent {
  @Input() user: any;
  @Output() closeDetail = new EventEmitter<void>();
  @Output() orderSelected = new EventEmitter<any>(); // Emits the selected order

  close() {
    this.closeDetail.emit();
  }

  selectOrder(order: any) {
    console.log("here")
    this.orderSelected.emit(order); // Emit the selected order to the parent
  }
}
