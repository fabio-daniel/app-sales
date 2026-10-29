import { Component, EventEmitter, Input, Output } from '@angular/core';

/**
 * Barra de paginación reutilizable: resumen del rango, selector de filas y botones de página.
 * El padre conserva `page` y `pageSize` y recorta sus datos al recibir los eventos.
 * El contenido proyectado se muestra al final del resumen (por ejemplo "· Total: 100").
 */
@Component({
  selector: 'app-paginator',
  templateUrl: './paginator.component.html',
  styleUrls: ['./paginator.component.scss']
})
export class PaginatorComponent {
  /** Cantidad de registros ya filtrados. */
  @Input() total = 0;
  /** Cantidad de registros sin filtrar; si hay filtros se muestra "(de N)". */
  @Input() overall: number | null = null;
  @Input() hasFilters = false;
  @Input() page = 1;
  @Input() pageSize = 10;
  @Input() pageSizes: number[] = [5, 10, 25, 50];
  @Input() singular = 'registro';
  @Input() plural = 'registros';

  @Output() pageChange = new EventEmitter<number>();
  @Output() pageSizeChange = new EventEmitter<number>();

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.total / this.pageSize));
  }

  get rangeStart(): number {
    return this.total ? (this.page - 1) * this.pageSize + 1 : 0;
  }

  get rangeEnd(): number {
    return Math.min(this.page * this.pageSize, this.total);
  }

  /** Números de página a mostrar; `null` representa los puntos suspensivos. */
  get pageNumbers(): (number | null)[] {
    const pages: (number | null)[] = [];
    let last = 0;

    for (let p = 1; p <= this.totalPages; p++) {
      if (p === 1 || p === this.totalPages || Math.abs(p - this.page) <= 1) {
        if (last && p - last > 1) {
          pages.push(null);
        }
        pages.push(p);
        last = p;
      }
    }

    return pages;
  }
}
