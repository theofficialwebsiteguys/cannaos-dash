import { Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { OrdersComponent } from './components/orders/orders.component';
import { UsersComponent } from './components/users/users.component';
import { BudtenderSalesComponent } from './components/budtender-sales/budtender-sales.component';

export const routes: Routes = [
    {
      path: 'dashboard',
      component: DashboardComponent,
      children: [
        { path: 'orders', component: OrdersComponent },
        { path: 'users', component: UsersComponent },
        { path: 'budtender-sales', component: BudtenderSalesComponent },
        // add more child routes here as needed
        { path: '', redirectTo: 'orders', pathMatch: 'full' }
      ]
    },
    { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    // fallback in case of invalid URL
    { path: '**', redirectTo: 'dashboard' }
  ];