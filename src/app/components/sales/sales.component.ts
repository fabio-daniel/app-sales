import { Component, HostListener, OnInit } from '@angular/core';

import { Sale } from '../../models/sale';
import { SaleService } from '../../services/sale.service';
import { NotifyService } from '../../services/notify.service';
import { normalize } from '../../utils/text';
import { localDate } from '../../utils/date';

@Component({
  selector: 'app-sales',
  templateUrl: './sales.component.html',
  styleUrls: ['./sales.component.scss']
})
export class SalesComponent implements OnInit {
  sales: Sale[] = [];
  filtered: Sale[] = [];
  paged: Sale[] = [];
  selected: Sale | null = null;
  loading = true;

  // Filtros
  search = '';
  dateFrom = '';
  dateTo = '';
  minTotal: number | null = null;
  maxTotal: number | null = null;

  // Paginación (la barra la dibuja <app-paginator>)
  pageSize = 10;
  page = 1;
  filteredTotal = 0;

  constructor(private saleService: SaleService, private notify: NotifyService) { }

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.saleService.getAll().subscribe({
      next: sales => {
        this.sales = sales;
        this.loading = false;
        this.applyFilters(false);
      },
      error: err => {
        this.loading = false;
        this.notify.httpError(err);
      }
    });
  }

  get hasFilters(): boolean {
    return !!(this.search.trim() || this.dateFrom || this.dateTo
      || this.minTotal !== null || this.maxTotal !== null);
  }

  applyFilters(resetPage = true): void {
    const term = normalize(this.search.trim().replace(/^#/, ''));

    this.filtered = this.sales.filter(sale => {
      if (term) {
        const haystack = normalize([
          sale.id,
          sale.user?.name ?? '',
          sale.user?.email ?? '',
          ...sale.details.map(d => d.product ?? '')
        ].join(' '));

        if (!haystack.includes(term)) {
          return false;
        }
      }

      const date = localDate(sale.created_at_datetime);
      if (this.dateFrom && date < this.dateFrom) {
        return false;
      }
      if (this.dateTo && date > this.dateTo) {
        return false;
      }

      if (this.minTotal !== null && sale.total < this.minTotal) {
        return false;
      }
      return !(this.maxTotal !== null && sale.total > this.maxTotal);
    });

    this.filteredTotal = this.filtered.reduce((sum, sale) => sum + sale.total, 0);

    if (resetPage) {
      this.page = 1;
    }
    this.paginate();
  }

  clearFilters(): void {
    this.search = '';
    this.dateFrom = '';
    this.dateTo = '';
    this.minTotal = null;
    this.maxTotal = null;
    this.applyFilters();
  }

  /** Recalcula las filas de la página actual (y corrige la página si quedó fuera de rango). */
  private paginate(): void {
    const totalPages = Math.max(1, Math.ceil(this.filtered.length / this.pageSize));
    this.page = Math.min(Math.max(1, this.page), totalPages);

    const start = (this.page - 1) * this.pageSize;
    this.paged = this.filtered.slice(start, start + this.pageSize);
  }

  goTo(page: number): void {
    this.page = page;
    this.paginate();
  }

  setPageSize(size: number): void {
    this.pageSize = size;
    this.page = 1;
    this.paginate();
  }

  open(sale: Sale): void {
    this.selected = sale;
  }

  @HostListener('document:keydown.escape')
  close(): void {
    this.selected = null;
  }

  delete(sale: Sale): void {
    if (!confirm(`¿Eliminar la venta #${sale.id}?`)) {
      return;
    }

    this.saleService.delete(sale.id).subscribe({
      next: res => {
        this.notify.success(res.message);
        this.load();
      },
      error: err => this.notify.httpError(err)
    });
  }
}
