import { Component, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatSort, MatSortModule } from '@angular/material/sort';

@Component({
  selector: 'lib-order-details',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatButtonModule, MatCardModule, MatSortModule],
  templateUrl: './order-details.component.html',
  styleUrl: './order-details.component.scss'
})
export class OrderDetailsComponent {
  @ViewChild(MatSort) sort!: MatSort;
  @Input() order: any;
  @Output() back = new EventEmitter<void>();

  ordersData = new MatTableDataSource<any>();

  ngOnInit(){
    console.log(this.order)
  }

  ngOnChanges() {
    if (this.order && this.order.items) {
      this.ordersData.data = this.order.items;
  
      if (this.sort) {
        this.ordersData.sort = this.sort;
      }
    }
  }
  
  ngAfterViewInit() {
    if (this.sort) {
      this.ordersData.sort = this.sort;
    }
  }
  
  

  goBack() {
    this.back.emit();
  }
}
