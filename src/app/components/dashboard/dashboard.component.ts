import { Component } from '@angular/core';
import { DataService } from '../../services/data.service';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon'; // ✅ Add this
import { MatFormFieldModule } from '@angular/material/form-field'; // ✅ Needed for search bar
import { MatInputModule } from '@angular/material/input'; // ✅ Needed for input fields

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatTableModule, MatTabsModule, MatIconModule, MatFormFieldModule, MatInputModule ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {
  users: any[] = [];
  orders: any[] = [];
  employeeOrders: any[] = [];
  totalOrderAmount = 0;
  totalEmployeeSales = 0;

  filteredUsers: any[] = [];
  filteredOrders: any[] = [];
  filteredEmployeeOrders: any[] = [];

  selectedTabIndex: number = 0;

  constructor(private dataService: DataService) {}

  ngOnInit(): void {
    this.fetchUserData();
    this.fetchOrdersData();
    this.fetchEmployeeOrdersData();
  }

  // Fetch Users
  fetchUserData() {
    this.dataService.getUserData().subscribe(
      (data) => {
        this.users = data.map(user => ({ ...user, role: user.role || 'N/A' }));
        this.filteredUsers = [...this.users]; // Copy data for filtering
      },
      (error) => console.error('Error fetching users:', error)
    );
  }

  // Fetch Orders
  fetchOrdersData() {
    this.dataService.getOrdersData().subscribe(
      (data) => {
        this.orders = data;
        this.filteredOrders = [...this.orders];
        this.totalOrderAmount = data.reduce((sum, order) => sum + parseFloat(order.total_amount), 0);
      },
      (error) => console.error('Error fetching orders:', error)
    );
  }

  // Fetch Employee Orders
  fetchEmployeeOrdersData() {
    this.dataService.getOrdersByEmployeesData().subscribe(
      (data) => {
        this.employeeOrders = data;
        this.filteredEmployeeOrders = [...this.employeeOrders];
        this.totalEmployeeSales = data.reduce((sum, order) => sum + parseFloat(order.total_amount), 0);
      },
      (error) => console.error('Error fetching employee orders:', error)
    );
  }

  // Apply Filters
  applyUserFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value.toLowerCase();
    this.filteredUsers = this.users.filter(user =>
      user.fname.toLowerCase().includes(filterValue) ||
      user.lname.toLowerCase().includes(filterValue) ||
      user.email.toLowerCase().includes(filterValue) ||
      user.role.toLowerCase().includes(filterValue)
    );
  }

  applyOrderFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value.toLowerCase();
    this.filteredOrders = this.orders.filter(order =>
      order.id.toString().includes(filterValue) ||
      order.user_id?.toString().includes(filterValue) ||
      order.total_amount?.toString().includes(filterValue)
    );
  }

  applyEmployeeOrderFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value.toLowerCase();
    this.filteredEmployeeOrders = this.employeeOrders.filter(order =>
      order.Employee?.fname.toLowerCase().includes(filterValue) ||
      order.Employee?.lname.toLowerCase().includes(filterValue) ||
      order.Employee?.role.toLowerCase().includes(filterValue)
    );
  }

  // Get Order Status Class for Styling
  getOrderStatusClass(complete: boolean): string {
    return complete ? 'completed' : 'pending';
  }

  // Get Role Class for Styling
  getRoleClass(role: string): string {
    if (role === 'admin') return 'admin';
    if (role === 'customer') return 'customer';
    if (role === 'employee') return 'employee';
    return 'unknown';
  }

  // Refresh Data
  refreshTable(type: string) {
    if (type === 'users') this.fetchUserData();
    if (type === 'orders') this.fetchOrdersData();
    if (type === 'employeeOrders') this.fetchEmployeeOrdersData();
  }
}
