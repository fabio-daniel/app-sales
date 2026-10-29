import { Component, OnInit } from '@angular/core';

import { Product } from '../../models/product';
import { ProductService } from '../../services/product.service';
import { NotifyService } from '../../services/notify.service';
import { normalize } from '../../utils/text';

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html'
})
export class ProductsComponent implements OnInit {
  products: Product[] = [];
  filtered: Product[] = [];
  paged: Product[] = [];
  loading = true;

  // Paginación (la barra la dibuja <app-paginator>)
  pageSize = 10;
  page = 1;

  // Filtros
  search = '';
  minPrice: number | null = null;
  maxPrice: number | null = null;
  minStock: number | null = null;
  maxStock: number | null = null;

  constructor(private productService: ProductService, private notify: NotifyService) { }

  ngOnInit(): void {
    this.productService.getAll().subscribe({
      next: products => {
        this.products = products;
        this.loading = false;
        this.applyFilters();
      },
      error: err => {
        this.loading = false;
        this.notify.httpError(err);
      }
    });
  }

  get hasFilters(): boolean {
    return !!(this.search.trim() || this.minPrice !== null || this.maxPrice !== null
      || this.minStock !== null || this.maxStock !== null);
  }

  applyFilters(resetPage = true): void {
    const term = normalize(this.search.trim().replace(/^#/, ''));

    this.filtered = this.products.filter(product => {
      if (term && !normalize(`${product.id} ${product.name}`).includes(term)) {
        return false;
      }
      if (this.minPrice !== null && product.price < this.minPrice) {
        return false;
      }
      if (this.maxPrice !== null && product.price > this.maxPrice) {
        return false;
      }
      if (this.minStock !== null && product.stock < this.minStock) {
        return false;
      }
      return !(this.maxStock !== null && product.stock > this.maxStock);
    });

    if (resetPage) {
      this.page = 1;
    }
    this.paginate();
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

  clearFilters(): void {
    this.search = '';
    this.minPrice = null;
    this.maxPrice = null;
    this.minStock = null;
    this.maxStock = null;
    this.applyFilters();
  }
}
