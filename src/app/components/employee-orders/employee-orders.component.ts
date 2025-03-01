import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { OrderDetailsComponent } from '../order-details/order-details.component';

@Component({
  selector: 'app-employee-orders',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatButtonModule, OrderDetailsComponent],
  templateUrl: './employee-orders.component.html',
  styleUrl: './employee-orders.component.scss'
})
export class EmployeeOrdersComponent {
  @Input() employee: any;
  @Output() goBack = new EventEmitter<void>();

  displayedColumns: string[] = ['id', 'pos_order_id', 'total_amount', 'points_add', 'points_locked', 'points_awarded', 'createdAt', 'complete'];
  ordersData = new MatTableDataSource<any>([]);
  selectedOrder: any = null;

  ngOnChanges() {
    if (this.employee) {
      this.ordersData.data = this.employee.orders;
      console.log(this.employee);
    }
  }

  selectOrder(order: any) {
    this.selectedOrder = order;
  }

  clearSelection() {
    this.selectedOrder = null;
  }
}
