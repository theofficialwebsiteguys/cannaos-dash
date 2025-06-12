import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { OrderDetailsComponent } from '../order-details/order-details.component';
import { MatSort, MatSortModule } from '@angular/material/sort';

@Component({
  selector: 'lib-employee-orders',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatButtonModule, OrderDetailsComponent, MatSortModule],
  templateUrl: './employee-orders.component.html',
  styleUrl: './employee-orders.component.scss'
})
export class EmployeeOrdersComponent {
  @ViewChild(MatSort) sort!: MatSort;
  @Input() employee: any;
  @Output() goBack = new EventEmitter<void>();

  displayedColumns: string[] = ['id', 'pos_order_id', 'total_amount', 'points_add', 'points_locked', 'points_awarded', 'createdAt', 'complete'];
  ordersData = new MatTableDataSource<any>([]);
  selectedOrder: any = null;

  ngOnChanges() {
    if (this.employee) {
      this.ordersData.data = this.employee.orders;
  
      // Attach sort AFTER setting data
      if (this.sort) {
        this.ordersData.sort = this.sort;
      }
    }
  }

  ngAfterViewInit() {
    this.ordersData.sort = this.sort;
  }
  

  selectOrder(order: any) {
    this.selectedOrder = order;
  }

  clearSelection() {
    this.selectedOrder = null;
  }
}
