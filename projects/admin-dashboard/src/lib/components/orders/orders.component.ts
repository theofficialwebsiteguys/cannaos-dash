import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTabsModule } from '@angular/material/tabs';
import { OrderDetailsComponent } from '../order-details/order-details.component';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { DataService } from '../../services/data.service';
import { saveAs } from 'file-saver';

@Component({
  selector: 'lib-orders',
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


  exportToCSV() {
    const data = this.filteredOrders.filteredData.map(order => ({
      ID: order.id,
      "POS Order ID": order.pos_order_id,
      "User ID": order.user_id,
      "Points Added": order.points_add,
      "Points Redeemed": order.points_redeem,
      "Total Amount": `$${order.total_amount}`,
      "Created At": new Date(order.createdAt).toLocaleString()
    }));

    const csvContent = this.convertToCSV(data);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, `Orders_${new Date().toISOString().slice(0, 10)}.csv`);
  }

  /**
   * Converts an array of objects into CSV format.
   */
  convertToCSV(objArray: any[]) {
    const header = Object.keys(objArray[0]).join(',') + '\n';
    const rows = objArray.map(obj => Object.values(obj).map(value => `"${value}"`).join(',')).join('\n');
    return header + rows;
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

    this.calculateSalesAverages();
  }

  calculateSalesAverages() {
    if (!this.orders.length) return;

    // Convert order dates to Date objects
    const ordersWithDates = this.orders.map((order: any) => ({
        ...order,
        date: new Date(order.createdAt),
    }));

    // Create a map to store total sales per unique day
    const dailySalesMap = new Map<string, number>();
    const weeklySalesMap = new Map<string, number>();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    ordersWithDates.forEach(order => {
        const orderDate = new Date(order.date);
        orderDate.setHours(0, 0, 0, 0); // Normalize time for comparison
        const dateKey = orderDate.toISOString().split("T")[0]; // Format: YYYY-MM-DD

        // Sum up daily sales
        dailySalesMap.set(dateKey, (dailySalesMap.get(dateKey) || 0) + order.total_amount);

        // Determine the start of the week for each order
        const weekStart = new Date(orderDate);
        weekStart.setDate(orderDate.getDate() - orderDate.getDay()); // Get Sunday of the week
        weekStart.setHours(0, 0, 0, 0);
        const weekKey = weekStart.toISOString().split("T")[0]; // Format: YYYY-MM-DD

        // Sum up weekly sales
        weeklySalesMap.set(weekKey, (weeklySalesMap.get(weekKey) || 0) + order.total_amount);
    });

    // Calculate cumulative daily average
    const totalDailySales = Array.from(dailySalesMap.values()).reduce((sum, value) => sum + value, 0);
    const totalDays = dailySalesMap.size; // Number of unique days with sales
    this.avgDailySales = totalDays > 0 ? totalDailySales / totalDays : 0;

    // Calculate cumulative weekly average
    const totalWeeklySales = Array.from(weeklySalesMap.values()).reduce((sum, value) => sum + value, 0);
    const totalWeeks = weeklySalesMap.size; // Number of unique weeks with sales
    this.avgWeeklySales = totalWeeks > 0 ? totalWeeklySales / totalWeeks : 0;

    // Calculate cumulative monthly average
    const monthlySalesMap = new Map<string, number>();

    ordersWithDates.forEach(order => {
        const orderDate = new Date(order.date);
        const monthKey = `${orderDate.getFullYear()}-${orderDate.getMonth() + 1}`; // Format: YYYY-MM

        // Sum up monthly sales
        monthlySalesMap.set(monthKey, (monthlySalesMap.get(monthKey) || 0) + order.total_amount);
    });

    const totalMonthlySales = Array.from(monthlySalesMap.values()).reduce((sum, value) => sum + value, 0);
    const totalMonths = monthlySalesMap.size; // Number of unique months with sales
    this.avgMonthlySales = totalMonths > 0 ? totalMonthlySales / totalMonths : 0;
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
