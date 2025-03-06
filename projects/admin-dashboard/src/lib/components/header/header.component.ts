import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { DataService } from '../../services/data.service';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'lib-header',
  standalone: true,
  imports: [CommonModule, MatIconModule, RouterModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  today: string;
  totalSalesToday: number = 0;
  totalOrdersToday: number = 0;
  topProductToday: string = '';

  constructor(private dataService: DataService) {
    this.today = this.getFormattedDate();
  }

  ngOnInit(): void {
    this.dataService.orders$.subscribe(orders => {
      this.calculateTodayMetrics(orders);
    });

    this.dataService.fetchOrdersData().subscribe(); // Ensure orders are loaded
  }

  getFormattedDate(): string {
    const date = new Date();
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    };
    return date.toLocaleDateString('en-US', options);
  }

  calculateTodayMetrics(orders: any[]): void {
    const todayStr = new Date().toDateString();
    const productCount: { [key: string]: number } = {};
    
    this.totalSalesToday = 0;
    this.totalOrdersToday = 0;

    orders.forEach(order => {
      const orderDate = new Date(order.createdAt).toDateString();
      if (orderDate === todayStr) {
        this.totalSalesToday += parseFloat(order.total_amount);
        this.totalOrdersToday++;

        order.items.forEach((item: any) => {
          productCount[item.title] = (productCount[item.title] || 0) + item.quantity;
        });
      }
    });

    this.topProductToday = Object.keys(productCount).reduce(
      (a, b) => (productCount[a] > productCount[b] ? a : b), ''
    );
  }
}
