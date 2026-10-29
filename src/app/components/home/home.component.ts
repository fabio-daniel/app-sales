import { Component, OnInit } from '@angular/core';

import { Sale } from '../../models/sale';
import { SaleService } from '../../services/sale.service';
import { NotifyService } from '../../services/notify.service';
import { localDate } from '../../utils/date';

/** Cantidad de días que muestra el gráfico de ventas diarias. */
const DAYS = 14;
/** Cuántos productos se muestran en los rankings antes de agrupar el resto. */
const TOP = 5;
const PALETTE = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
const OTHERS_COLOR = '#94a3b8';

interface DayBar {
  label: string;
  total: number;
  /** Altura de la barra respecto al día con más ventas (0 a 100). */
  pct: number;
}

interface ProductStat {
  name: string;
  units: number;
  amount: number;
}

interface TopProduct extends ProductStat {
  /** Ancho de la barra respecto al producto más vendido (0 a 100). */
  pct: number;
}

interface Slice {
  name: string;
  amount: number;
  pct: number;
  color: string;
  /** Porcentaje acumulado de las porciones anteriores, para posicionar el arco. */
  offset: number;
}

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  readonly days = DAYS;
  loading = true;

  salesCount = 0;
  revenue = 0;
  units = 0;
  discount = 0;
  avgTicket = 0;

  daily: DayBar[] = [];
  maxDaily = 0;
  topProducts: TopProduct[] = [];
  slices: Slice[] = [];
  latest: Sale[] = [];

  constructor(private saleService: SaleService, private notify: NotifyService) { }

  ngOnInit(): void {
    this.saleService.getAll().subscribe({
      next: sales => {
        this.compute(sales);
        this.loading = false;
      },
      error: err => {
        this.loading = false;
        this.notify.httpError(err);
      }
    });
  }

  /** Números cortos para los ejes: 1.2K, 3.4M. */
  compact(value: number): string {
    const abs = Math.abs(value);
    if (abs >= 1_000_000) {
      return `${+(value / 1_000_000).toFixed(1)}M`;
    }
    if (abs >= 1_000) {
      return `${+(value / 1_000).toFixed(1)}K`;
    }
    return `${+value.toFixed(0)}`;
  }

  private compute(sales: Sale[]): void {
    this.salesCount = sales.length;
    this.revenue = sales.reduce((sum, s) => sum + s.total, 0);
    this.discount = sales.reduce((sum, s) => sum + s.total_discount, 0);
    this.units = sales.reduce((sum, s) => sum + s.units, 0);
    this.avgTicket = this.salesCount ? this.revenue / this.salesCount : 0;
    this.latest = sales.slice(0, 5);

    this.computeDaily(sales);
    this.computeProducts(sales);
  }

  /** Total vendido por día durante los últimos DAYS días (incluye los días sin ventas). */
  private computeDaily(sales: Sale[]): void {
    const byDay = new Map<string, number>();
    for (const sale of sales) {
      const key = localDate(sale.created_at_datetime);
      byDay.set(key, (byDay.get(key) ?? 0) + sale.total);
    }

    const bars: DayBar[] = [];
    for (let i = DAYS - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const key = localDate(date);
      const [, month, day] = key.split('-');
      bars.push({ label: `${day}/${month}`, total: byDay.get(key) ?? 0, pct: 0 });
    }

    this.maxDaily = Math.max(0, ...bars.map(b => b.total));
    bars.forEach(b => b.pct = this.maxDaily ? (b.total / this.maxDaily) * 100 : 0);
    this.daily = bars;
  }

  /** Ranking de productos por unidades y reparto del monto vendido por producto. */
  private computeProducts(sales: Sale[]): void {
    const stats = new Map<string, ProductStat>();
    for (const sale of sales) {
      for (const detail of sale.details) {
        const name = detail.product ?? 'Producto eliminado';
        const stat = stats.get(name) ?? { name, units: 0, amount: 0 };
        stat.units += detail.quantity;
        stat.amount += detail.subtotal_with_discount;
        stats.set(name, stat);
      }
    }
    const all = [...stats.values()];

    const byUnits = [...all].sort((a, b) => b.units - a.units).slice(0, TOP);
    const maxUnits = byUnits[0]?.units ?? 0;
    this.topProducts = byUnits.map(p => ({ ...p, pct: maxUnits ? (p.units / maxUnits) * 100 : 0 }));

    const byAmount = [...all].sort((a, b) => b.amount - a.amount);
    const total = byAmount.reduce((sum, p) => sum + p.amount, 0);
    const main = byAmount.slice(0, TOP);
    const othersAmount = byAmount.slice(TOP).reduce((sum, p) => sum + p.amount, 0);
    const parts = [
      ...main.map((p, i) => ({ name: p.name, amount: p.amount, color: PALETTE[i] })),
      ...(othersAmount > 0 ? [{ name: 'Otros', amount: othersAmount, color: OTHERS_COLOR }] : [])
    ];

    let offset = 0;
    this.slices = parts.map(part => {
      const pct = total ? (part.amount / total) * 100 : 0;
      const slice: Slice = { ...part, pct, offset };
      offset += pct;
      return slice;
    });
  }
}
