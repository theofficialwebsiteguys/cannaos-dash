import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { DataService } from '../../services/data.service';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTabsModule } from '@angular/material/tabs';
import { OrderDetailsComponent } from '../order-details/order-details.component';
import { MatSort, MatSortModule } from '@angular/material/sort';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, MatTableModule, FormsModule, MatButtonModule, MatInputModule, MatIconModule, MatTabsModule, OrderDetailsComponent, MatSortModule ],
  templateUrl: './orders.component.html',
  styleUrl: './orders.component.scss'
})
export class OrdersComponent implements AfterViewInit {
  @ViewChild(MatSort) sort!: MatSort;
  orders: any[] = [];
  filteredOrders = new MatTableDataSource<any>([]);
  selectedOrder: any = null;

   // Metrics to display
   topProduct: string = '';
   topCategory: string = '';
   topBrand: string = '';
   totalOrders: number = 0;
   totalAmount: number = 0;
   avgOrderAmount: number = 0;
   avgDailySales: number = 0;
   avgWeeklySales: number = 0;
   avgMonthlySales: number = 0;
 

  orderColumns = ['id', 'pos_order_id', 'user_id', 'points_add', 'points_redeem', 'total_amount', 'createdAt'];

  constructor(private dataService: DataService) {}

  ngOnInit(): void {
    this.dataService.orders$.subscribe(orders => {
      this.orders = orders;
      this.filteredOrders.data = orders;
      this.filteredOrders.filterPredicate = this.createFilter();
      this.calculateMetrics();
    });

    this.dataService.fetchOrdersData().subscribe();
  }

  ngAfterViewInit() {
    if (this.sort) {
      this.filteredOrders.sort = this.sort;
    }
  }

  createFilter(): (data: any, filter: string) => boolean {
    return (data, filter) => {
      const dataStr = Object.keys(data)
        .map(key => data[key])
        .join(' ')
        .toLowerCase();
      return dataStr.includes(filter);
    };
  }


  calculateMetrics() {
    const productCount: { [key: string]: number } = {};
    const categoryCount: { [key: string]: number } = {};
    const brandCount: { [key: string]: number } = {};
    let totalSales = 0;
    let orderDates: Date[] = [];

    this.orders.forEach(order => {
      orderDates.push(new Date(order.createdAt));
      totalSales += parseFloat(order.total_amount);
      this.totalOrders++;

      order.items.forEach((item:any) => {
        productCount[item.title] = (productCount[item.title] || 0) + item.quantity;
        categoryCount[item.category] = (categoryCount[item.category] || 0) + item.quantity;
        brandCount[item.brand] = (brandCount[item.brand] || 0) + item.quantity;
      });
    });

    this.totalAmount = totalSales;
    this.avgOrderAmount = this.totalOrders ? this.totalAmount / this.totalOrders : 0;

    this.topProduct = Object.keys(productCount).reduce((a, b) => (productCount[a] > productCount[b] ? a : b), '');
    this.topCategory = Object.keys(categoryCount).reduce((a, b) => (categoryCount[a] > categoryCount[b] ? a : b), '');
    this.topBrand = Object.keys(brandCount).reduce((a, b) => (brandCount[a] > brandCount[b] ? a : b), '');

    this.calculateSalesAverages(orderDates);
  }

  calculateSalesAverages(orderDates: Date[]) {
    if (!orderDates.length) return;

    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - 7);

    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const dailySales = orderDates.filter(date => date.toDateString() === today.toDateString()).length;
    const weeklySales = orderDates.filter(date => date >= startOfWeek).length;
    const monthlySales = orderDates.filter(date => date >= startOfMonth).length;

    this.avgDailySales = dailySales;
    this.avgWeeklySales = weeklySales / 7;
    this.avgMonthlySales = monthlySales / new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value.trim().toLowerCase();
    this.filteredOrders.filter = filterValue;
  }

  selectOrder(order: any) {
    this.selectedOrder = order;
  }

  clearSelection() {
    this.selectedOrder = null;
  }
  
}
