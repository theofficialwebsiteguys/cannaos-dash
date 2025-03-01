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

@Component({
  selector: 'app-budtender-sales',
  standalone: true,
  imports: [CommonModule, MatTableModule, FormsModule, MatButtonModule, MatInputModule, MatIconModule, MatTabsModule, EmployeeOrdersComponent, MatSortModule],
  templateUrl: './budtender-sales.component.html',
  styleUrl: './budtender-sales.component.scss'
})
export class BudtenderSalesComponent implements AfterViewInit{
  @ViewChild(MatSort) sort!: MatSort;  // ✅ MatSort ViewChild reference
  displayedColumns: string[] = ['employee', 'totalSales', 'monthlyAverage', 'weeklyAverage', 'dailyAverage', 'mostSoldProduct', 'mostSoldCategory', 'view'];
  employeeSales = new MatTableDataSource<any>([]);
  selectedEmployee: any | null = null;

  constructor(private dataService: DataService) {}

  ngOnInit(): void {
    this.dataService.employeeOrders$.subscribe(employeeOrders => {
      this.groupOrdersByEmployee(employeeOrders);
    });

    this.dataService.fetchOrdersByEmployeesData().subscribe();
  }

  ngAfterViewInit() {
    console.log("ngAfterViewInit triggered 🚀");
    if (this.sort) {
      this.employeeSales.sort = this.sort;
      console.log("MatSort assigned ✅", this.sort);
    } else {
      console.error("MatSort is undefined ❌. Check @ViewChild(MatSort)");
    }
  }

  groupOrdersByEmployee(orders: any[]) {
    const grouped = orders.reduce((acc, order) => {
      const empId = order.Employee.id;
      const orderDate = new Date(order.createdAt);

      if (!acc[empId]) {
        acc[empId] = {
          employee: `${order.Employee.fname} ${order.Employee.lname}`,
          totalSales: 0,
          orders: [],
          firstOrderDate: orderDate,
          lastOrderDate: orderDate,
          productCount: {}, // Track product frequency
          categoryCount: {}, // Track category frequency
        };
      }

      acc[empId].totalSales += Number(order.total_amount);
      acc[empId].orders.push(order);

      // Update first and last order dates
      acc[empId].firstOrderDate = orderDate < acc[empId].firstOrderDate ? orderDate : acc[empId].firstOrderDate;
      acc[empId].lastOrderDate = orderDate > acc[empId].lastOrderDate ? orderDate : acc[empId].lastOrderDate;

      // Process items in the order
      if (order.items) {
        order.items.forEach((item: any) => {
          // Track most sold product
          if (!acc[empId].productCount[item.title]) {
            acc[empId].productCount[item.title] = 0;
          }
          acc[empId].productCount[item.title] += item.quantity;

          // Track most sold category
          if (!acc[empId].categoryCount[item.category]) {
            acc[empId].categoryCount[item.category] = 0;
          }
          acc[empId].categoryCount[item.category] += item.quantity;
        });
      }

      return acc;
    }, {});

    // Compute averages and find most sold product/category
    Object.values(grouped).forEach((emp: any) => {
      const { firstOrderDate, lastOrderDate, totalSales, productCount, categoryCount } = emp as any;

      // Ensure first and last dates are valid
      if (!(firstOrderDate instanceof Date) || !(lastOrderDate instanceof Date)) {
        console.error(`Invalid date detected for ${emp.employee}`);
        return;
      }

      // Date calculations
      const msDiff = lastOrderDate.getTime() - firstOrderDate.getTime();
      const daysActive = msDiff > 0 ? Math.ceil(msDiff / (1000 * 60 * 60 * 24)) : 1;
      const weeksActive = Math.ceil(daysActive / 7);
      const monthsActive = Math.ceil(daysActive / 30);

      emp.dailyAverage = daysActive > 0 ? totalSales / daysActive : 0;
      emp.weeklyAverage = weeksActive > 0 ? totalSales / weeksActive : 0;
      emp.monthlyAverage = monthsActive > 0 ? totalSales / monthsActive : 0;

      // Get most sold product
      emp.mostSoldProduct = this.getMostSold(productCount);

      // Get most sold category
      emp.mostSoldCategory = this.getMostSold(categoryCount);
    });

    this.employeeSales.data = Object.values(grouped);
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

}
