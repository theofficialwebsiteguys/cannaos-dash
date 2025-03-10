import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { DataService } from '../../services/data.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDialog } from '@angular/material/dialog';
import { EmployeeOrdersComponent } from '../employee-orders/employee-orders.component';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { saveAs } from 'file-saver';

@Component({
  selector: 'lib-budtender-sales',
  standalone: true,
  imports: [CommonModule, MatTableModule, FormsModule, MatButtonModule, MatInputModule, MatIconModule, MatTabsModule, EmployeeOrdersComponent, MatSortModule],
  templateUrl: './budtender-sales.component.html',
  styleUrl: './budtender-sales.component.scss'
})
export class BudtenderSalesComponent implements AfterViewInit{
  @ViewChild(MatSort) sort!: MatSort;
  displayedColumns: string[] = ['employee', 'totalSales', 'totalSalesAmount', 'monthlyAverage', 'weeklyAverage', 'dailyAverage', 'mostSoldProduct', 'mostSoldCategory', 'view'];
  employeeSales = new MatTableDataSource<any>([]);
  selectedEmployee: any | null = null;

  constructor(private dataService: DataService) {}

  ngOnInit(): void {
    this.dataService.employeeOrders$.subscribe(employeeOrders => {
      this.processEmployeeData(employeeOrders);
    });

    this.dataService.fetchOrdersByEmployeesData().subscribe();
  }

  ngAfterViewInit() {
    if (this.sort) {
      this.employeeSales.sort = this.sort;
    }
  }

  processEmployeeData(employees: any[]) {
    const processedEmployees = employees.map(employee => {
      const orders = employee.EmployeeOrders || []; // Ensure it handles employees with no sales
      const totalSalesAmount = orders.reduce((sum: any, order: any) => sum + Number(order.total_amount), 0);
      const totalSales = orders.length;

      let firstOrderDate = orders.length ? new Date(orders[0].createdAt) : null;
      let lastOrderDate = orders.length ? new Date(orders[orders.length - 1].createdAt) : null;

      const productCount: { [key: string]: number } = {};
      const categoryCount: { [key: string]: number } = {};

      // Process each order for product and category tracking
      orders.forEach((order: any) => {
        const orderDate = new Date(order.createdAt);
        if (!firstOrderDate || orderDate < firstOrderDate) firstOrderDate = orderDate;
        if (!lastOrderDate || orderDate > lastOrderDate) lastOrderDate = orderDate;

        order.items?.forEach((item: any) => {
          productCount[item.title] = (productCount[item.title] || 0) + item.quantity;
          categoryCount[item.category] = (categoryCount[item.category] || 0) + item.quantity;
        });
      });

      // Compute time-based averages
      let dailyAverage = 0, weeklyAverage = 0, monthlyAverage = 0;
      if (firstOrderDate && lastOrderDate) {
        const daysActive = Math.max(1, Math.ceil((lastOrderDate.getTime() - firstOrderDate.getTime()) / (1000 * 60 * 60 * 24)));
        const weeksActive = Math.max(1, Math.ceil(daysActive / 7));
        const monthsActive = Math.max(1, Math.ceil(daysActive / 30));

        dailyAverage = totalSalesAmount / daysActive;
        weeklyAverage = totalSalesAmount / weeksActive;
        monthlyAverage = totalSalesAmount / monthsActive;
      }

      return {
        employee: `${employee.fname} ${employee.lname}`,
        totalSales,
        totalSalesAmount,
        dailyAverage,
        weeklyAverage,
        monthlyAverage,
        mostSoldProduct: this.getMostSold(productCount),
        mostSoldCategory: this.getMostSold(categoryCount),
        orders: orders, // Keep orders linked for later viewing
      };
    });

    this.employeeSales.data = processedEmployees;
  }

  getMostSold(countObj: { [key: string]: number }) {
    return Object.entries(countObj)
      .sort((a, b) => b[1] - a[1]) // Sort by quantity sold
      .map(entry => `${entry[0]} (${entry[1]})`)[0] || 'N/A';
  }

  viewEmployeeOrders(employee: any) {
    this.selectedEmployee = employee;
  }

  goBackToSales() {
    this.selectedEmployee = null;
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value.trim().toLowerCase();
    this.employeeSales.filter = filterValue;
  }

  exportToCSV() {
    const data = this.employeeSales.filteredData.map(employee => ({
      Employee: employee.employee,
      "Total Sales": employee.totalSales,
      "Total Sales Amount": `$${employee.totalSalesAmount}`,
      "Monthly Average": `$${employee.monthlyAverage}`,
      "Weekly Average": `$${employee.weeklyAverage}`,
      "Daily Average": `$${employee.dailyAverage}`,
      "Most Sold Product": employee.mostSoldProduct,
      "Most Sold Category": employee.mostSoldCategory
    }));

    const csvContent = this.convertToCSV(data);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, `Budtender_Sales_${new Date().toISOString().slice(0, 10)}.csv`);
  }

  /**
   * Converts an array of objects into CSV format.
   */
  convertToCSV(objArray: any[]) {
    if (!objArray.length) return '';

    const header = Object.keys(objArray[0]).join(',') + '\n';
    const rows = objArray.map(obj => Object.values(obj).map(value => `"${value}"`).join(',')).join('\n');
    
    return header + rows;
  }
}
