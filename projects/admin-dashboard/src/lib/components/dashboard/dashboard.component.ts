import { Component, HostListener, OnInit } from '@angular/core';
import { DataService } from '../../services/data.service';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon'; // ✅ Add this
import { MatFormFieldModule } from '@angular/material/form-field'; // ✅ Needed for search bar
import { MatInputModule } from '@angular/material/input'; // ✅ Needed for input fields
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { HeaderComponent } from '../header/header.component';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { MatSidenav, MatSidenavModule } from '@angular/material/sidenav';
import { AdminService } from '../../services/admin.service';

@Component({
  selector: 'lib-dashboard',
  standalone: true,
  imports: [RouterModule, CommonModule, HeaderComponent, SidebarComponent, MatCardModule, MatButtonModule, MatTableModule, MatTabsModule, MatIconModule, MatFormFieldModule, MatInputModule, MatSidenavModule ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  users: any[] = [];
  orders: any[] = [];
  employeeOrders: any[] = [];
  totalOrderAmount = 0;
  totalEmployeeSales = 0;

  filteredUsers: any[] = [];
  filteredOrders: any[] = [];
  filteredEmployeeOrders: any[] = [];

  selectedTabIndex: number = 0;

 public userRole: 'admin' | 'employee' | null = null;

  constructor(private router: Router, private activatedRoute: ActivatedRoute, private adminService: AdminService, private dataService: DataService) { 
    const navigation = this.router.getCurrentNavigation();
    
    if (navigation?.extras.state) {
      this.userRole = navigation.extras.state['userRole'] as 'admin' | 'employee' || null;
      
      // Pass the retrieved role to the scoped service
      this.adminService.setRole(this.userRole);
      
      console.log('Dashboard received role:', this.userRole);
    }
  }

  isMobile: boolean = false;


  ngOnInit(): void {
    this.checkScreenSize();

    const currentRole = this.adminService.getRole();

    console.log('Current Role on Init:', currentRole);
  
    if (currentRole === 'admin') {
        this.router.navigate(['overview'], { relativeTo: this.activatedRoute, replaceUrl: true });
        
    } else if (currentRole === 'employee') {
        this.router.navigate(['tools'], { relativeTo: this.activatedRoute, replaceUrl: true });
        
    }
  }

  @HostListener('window:resize')
  onResize() {
    this.checkScreenSize();
  }

  checkScreenSize() {
    this.isMobile = window.innerWidth < 768;
  }
}
