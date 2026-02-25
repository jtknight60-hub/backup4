import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { OrderService } from '../../core/services/order.service';

@Component({
  selector: 'app-order-details',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './order-details.html',
  styleUrls: ['./order-details.css'],
})
export class OrderDetails {
  order: any | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private orderService: OrderService
  ) {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) this.load(id);
  }

  load(id: string) {
    const token = localStorage.getItem('token') || undefined;
    this.orderService.getOrderById(id, token).subscribe({
      next: (res) => (this.order = res),
      error: (err) => {
        console.error('Backend order fetch failed, falling back to localStorage', err);
        try {
          const raw = localStorage.getItem('ja_orders') || '[]';
          const all = JSON.parse(raw) as any[];
          this.order = all.find((o) => o.id === id) || null;
        } catch (e) {
          this.order = null;
        }
      }
    });
  }

  back() {
    this.router.navigate(['/order-history']);
  }
}
