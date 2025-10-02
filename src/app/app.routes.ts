import { Routes } from '@angular/router';
import { DashboardComponent } from '../../projects/admin-dashboard/src/lib/components/dashboard/dashboard.component';
import { OrdersComponent } from '../../projects/admin-dashboard/src/lib/components/orders/orders.component';
import { UsersComponent } from '../../projects/admin-dashboard/src/lib/components/users/users.component';
import { BudtenderSalesComponent } from '../../projects/admin-dashboard/src/lib/components/budtender-sales/budtender-sales.component';
import { ToolsComponent } from '../../projects/admin-dashboard/src/lib/components/tools/tools.component';
import { OverviewComponent } from '../../projects/admin-dashboard/src/lib/components/overview/overview.component';


export const routes: Routes = [
    {
      path: 'dashboard',
      component: DashboardComponent,
      children: [
        { path: 'overview', component: OverviewComponent },
        { path: 'orders', component: OrdersComponent },
        { path: 'users', component: UsersComponent },
        { path: 'budtender-sales', component: BudtenderSalesComponent },
        { path: 'tools', component: ToolsComponent }
      ]
    },
    { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    // fallback in case of invalid URL
    { path: '**', redirectTo: 'dashboard' }
  ];