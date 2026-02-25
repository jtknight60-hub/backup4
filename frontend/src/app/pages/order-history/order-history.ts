import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { OrderService } from '../../core/services/order.service';

@Component({
  selector: 'app-order-history',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './order-history.html',
  styleUrls: ['./order-history.css'],
})
export class OrderHistory {
  orders = signal<any[]>([]);
  session = signal<any | null>(null);

  constructor(private router: Router, private orderService: OrderService) {
    // initialize session
    try {
      const raw = localStorage.getItem('ja_session');
      if (raw) this.session.set(JSON.parse(raw));
    } catch {}

    // load orders for current session (try backend first)
    this.loadOrders();

    // update when storage changes (other tabs or actions)
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', (e) => {
        if (e.key === 'ja_orders' || e.key === 'ja_session') this.loadOrders();
      });
    }
  }

  loadOrders() {
    const s = this.session();
    const token = localStorage.getItem('token') || undefined;
    if (s && s.email) {
      // try backend
      this.orderService.getOrders(s.email, token).subscribe({
        next: (res) => this.orders.set(res || []),
        error: (err) => {
          console.error('Backend orders fetch failed, falling back to localStorage', err);
          try {
            const raw = localStorage.getItem('ja_orders') || '[]';
            const all = JSON.parse(raw) as any[];
            this.orders.set(all.filter(o => o.user && o.user.email === s.email));
          } catch (e) {
            this.orders.set([]);
          }
        }
      });
    } else {
      this.orders.set([]);
    }
  }

  viewOrder(o: any) {
    this.router.navigate(['/order', o.id]);
  }
}
