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
import { RouterModule } from '@angular/router';
import { HeaderComponent } from '../header/header.component';
import { SidebarComponent } from '../sidebar/sidebar.component';

@Component({
  selector: 'lib-dashboard',
  standalone: true,
  imports: [RouterModule, CommonModule, HeaderComponent, SidebarComponent, MatCardModule, MatButtonModule, MatTableModule, MatTabsModule, MatIconModule, MatFormFieldModule, MatInputModule ],
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
  }


}
