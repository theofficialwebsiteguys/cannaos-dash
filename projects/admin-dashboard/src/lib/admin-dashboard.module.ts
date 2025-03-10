import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BudtenderSalesComponent } from './components/budtender-sales/budtender-sales.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { EmployeeOrdersComponent } from './components/employee-orders/employee-orders.component';
import { HeaderComponent } from './components/header/header.component';
import { OrderDetailsComponent } from './components/order-details/order-details.component';
import { OrdersComponent } from './components/orders/orders.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { UserDetailComponent } from './components/user-detail/user-detail.component';
import { UsersComponent } from './components/users/users.component';
import { ToolsComponent } from './components/tools/tools.component';
import { OverviewComponent } from '../public-api';

@NgModule({
  declarations: [

  ],
  imports: [CommonModule,
    BudtenderSalesComponent,
    DashboardComponent,
    EmployeeOrdersComponent,
    HeaderComponent,
    OrderDetailsComponent,
    OrdersComponent,
    SidebarComponent,
    UserDetailComponent,
    UsersComponent,
    ToolsComponent,
    OverviewComponent
  ],
  exports: [
    BudtenderSalesComponent,
    DashboardComponent,
    EmployeeOrdersComponent,
    HeaderComponent,
    OrderDetailsComponent,
    OrdersComponent,
    SidebarComponent,
    UserDetailComponent,
    UsersComponent,
    ToolsComponent,
    OverviewComponent
  ]
})
export class AdminDashboardModule {}
