import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { DataService } from '../../services/data.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTabsModule } from '@angular/material/tabs';
import { UserDetailComponent } from '../user-detail/user-detail.component';
import { OrderDetailsComponent } from '../order-details/order-details.component';
import { MatSort, MatSortModule } from '@angular/material/sort';

@Component({
  selector: 'lib-users',
  standalone: true,
  imports: [CommonModule, MatTableModule, FormsModule, MatButtonModule, MatInputModule, MatIconModule, MatTabsModule, UserDetailComponent, OrderDetailsComponent, MatSortModule ],
  templateUrl: './users.component.html',
  styleUrl: './users.component.scss'
})
export class UsersComponent implements AfterViewInit {
  @ViewChild(MatSort) sort!: MatSort;
  
  users: any[] = [];
  orders: any[] = [];
  filteredUsers = new MatTableDataSource<any>([]);
  selectedUser: any = null; // Stores selected user for details view
  selectedOrder: any = null;

  userColumns = [
    'id', 'name', 'email', 'dob', 'country', 'phone', 'points', 
    'alleaves_customer_id', 'createdAt', 'mostOrderedProduct', 
    'mostOrderedCategory', 'averageSpend', 'totalSpent'
  ];

  constructor(private dataService: DataService) {}

  ngOnInit(): void {
    console.log("ngOnInit started");

    this.dataService.fetchUserData().subscribe();
    this.dataService.fetchOrdersData().subscribe();

    this.dataService.users$.subscribe(users => {
      console.log("Users received:", users);
      this.users = users;
      this.updateUsersWithOrders();
    });

    this.dataService.orders$.subscribe(orders => {
      console.log("Orders received:", orders);
      this.orders = orders;
      this.updateUsersWithOrders();
    });
  }

  ngAfterViewInit() {
    console.log("ngAfterViewInit triggered 🚀");
    if (this.sort) {
      this.filteredUsers.sort = this.sort;
      console.log("MatSort assigned ✅", this.sort);
    } else {
      console.error("MatSort is undefined ❌. Check @ViewChild(MatSort)");
    }
  }

  updateUsersWithOrders(): void {
    if (!this.users.length || !this.orders.length) return;
    this.filteredUsers.data = this.users.map(user => this.enrichUserData(user));
  }

  enrichUserData(user: any) {
    const userOrders = this.orders.filter(order => order.user_id === user.id);
  
    if (!userOrders.length) {
      return { 
        ...user, 
        mostOrderedProduct: 'N/A', 
        mostOrderedCategory: 'N/A', 
        averageSpend: 0, 
        totalSpent: 0,
        orders: []
      };
    }
  
    console.log(userOrders);
  
    // Flatten all items in orders into a single array
    const allOrderedItems = userOrders.flatMap(order => order.items || []);
  
    console.log("All ordered items:", allOrderedItems);
  
    // Count occurrences of product titles
    const productCounts = this.countOccurrences(allOrderedItems, 'title');
    console.log("Product counts:", productCounts);
    const mostOrderedProduct = this.getMostFrequent(productCounts);
  
    // Count occurrences of categories
    const categoryCounts = this.countOccurrences(allOrderedItems, 'category');
    console.log("Category counts:", categoryCounts);
    const mostOrderedCategory = this.getMostFrequent(categoryCounts);
  
    // Compute total spent
    const totalSpent = userOrders.reduce((sum, order) => sum + (order.total_amount || 0), 0);
    const averageSpend = totalSpent / userOrders.length;
  
    return {
      ...user,
      mostOrderedProduct,
      mostOrderedCategory,
      averageSpend: averageSpend.toFixed(2),
      totalSpent: totalSpent.toFixed(2),
      orders: userOrders // Attach orders for user details view
    };
  }
  
  countOccurrences(items: any[], key: string) {
    return items.reduce((acc, item) => {
      const value = this.getNestedValue(item, key);
      if (value) {
        acc[value] = (acc[value] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);
  }
  
  /**
   * Recursively gets the value of a nested key (e.g., "category.name")
   */
  getNestedValue(obj: any, key: string): any {
    return key.split('.').reduce((o, k) => (o && o[k] !== undefined ? o[k] : null), obj);
  }
  

  getMostFrequent(counts: Record<string, number>): string {
    return Object.entries(counts).reduce((a, b) => (b[1] > a[1] ? b : a), ['', 0])[0] || 'N/A';
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value.trim().toLowerCase();
    this.filteredUsers.filter = filterValue;
  }
  

  /**
   * Select a user to view details
   */
  selectUser(user: any) {
    this.selectedUser = user;
    this.selectedOrder = null; // Reset order selection
  }

  selectOrder(order: any) {
    this.selectedOrder = order;
  }

  /**
   * Close user details and return to table view
   */
  closeDetail() {
    if(this.selectedOrder){
      this.selectedOrder = null;
    }else{
      this.selectedUser = null;
    }

  }
}
