import { Component, HostListener, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { environment } from '../../../environments/environment';
import { Product } from '../../models/product';
import { ProductService } from '../../services/product.service';
import { SaleService } from '../../services/sale.service';
import { NotifyService } from '../../services/notify.service';

interface CartItem {
  product: Product;
  quantity: number;
  /** Descuento en % (0 a 10). */
  discount: number;
}

/** Por debajo (o igual) a este stock se muestra el aviso de "poco stock". */
const LOW_STOCK = 10;

/** Descuento máximo permitido por producto (en %). */
const MAX_DISCOUNT = 10;

/** Redondea a 2 decimales, igual que el backend. */
const round2 = (value: number): number => Math.round(value * 100) / 100;

@Component({
  selector: 'app-sale-form',
  templateUrl: './sale-form.component.html',
  styleUrls: ['./sale-form.component.scss']
})
export class SaleFormComponent implements OnInit {
  products: Product[] = [];
  cart: CartItem[] = [];
  search = '';
  loading = true;
  saving = false;
  /** Modal de confirmación abierto. */
  confirming = false;
  /** Momento en que se abrió la confirmación (se muestra como fecha de la venta). */
  confirmDate = new Date();
  readonly userId = environment.userId;
  today = new Date();
  /** Ids de productos cuya imagen no pudo cargarse (se muestra un ícono). */
  brokenImages = new Set<number>();

  constructor(
    private router: Router,
    private productService: ProductService,
    private saleService: SaleService,
    private notify: NotifyService
  ) { }

  ngOnInit(): void {
    this.productService.getAll().subscribe({
      next: products => {
        this.products = products;
        this.loading = false;
      },
      error: err => {
        this.loading = false;
        this.notify.httpError(err);
      }
    });
  }

  hasImage(product: Product): boolean {
    return !!product.image && !this.brokenImages.has(product.id);
  }

  stockState(product: Product): 'ok' | 'low' | 'out' {
    if (product.stock < 1) {
      return 'out';
    }
    return product.stock <= LOW_STOCK ? 'low' : 'ok';
  }

  get filteredProducts(): Product[] {
    const term = this.search.trim().toLowerCase();
    return term
      ? this.products.filter(p => p.name.toLowerCase().includes(term))
      : this.products;
  }

  /** Suma de subtotales con descuento (lo que se cobra). */
  get total(): number {
    return round2(this.cart.reduce((sum, item) => sum + this.net(item), 0));
  }

  /** Suma de subtotales sin descuento. */
  get grossTotal(): number {
    return round2(this.cart.reduce((sum, item) => sum + this.subtotal(item), 0));
  }

  get totalDiscount(): number {
    return round2(this.cart.reduce((sum, item) => sum + this.discountAmount(item), 0));
  }

  get count(): number {
    return this.cart.reduce((sum, item) => sum + item.quantity, 0);
  }

  /** subtotal = precio × cantidad */
  subtotal(item: CartItem): number {
    return round2(item.product.price * item.quantity);
  }

  /** discount_amount = subtotal × (discount_percent / 100) */
  discountAmount(item: CartItem): number {
    return round2(this.subtotal(item) * (item.discount / 100));
  }

  /** subtotal_with_discount = subtotal − discount_amount */
  net(item: CartItem): number {
    return round2(this.subtotal(item) - this.discountAmount(item));
  }

  /** Unidades de un producto que ya están en el carrito. */
  inCart(product: Product): number {
    return this.cart.find(item => item.product.id === product.id)?.quantity ?? 0;
  }

  /** Unidades que todavía se pueden agregar sin superar el stock. */
  remaining(product: Product): number {
    return product.stock - this.inCart(product);
  }

  add(product: Product): void {
    const item = this.cart.find(i => i.product.id === product.id);

    if (!item) {
      if (product.stock < 1) {
        return this.notify.error(`"${product.name}" no tiene stock.`);
      }
      this.cart.push({ product, quantity: 1, discount: 0 });
      return;
    }

    this.setQuantity(item, item.quantity + 1);
  }

  decrease(item: CartItem): void {
    this.setQuantity(item, item.quantity - 1);
  }

  /** Fija la cantidad respetando el mínimo (1) y el stock disponible. */
  setQuantity(item: CartItem, value: number): void {
    const quantity = Math.floor(Number(value));

    if (!quantity || quantity < 1) {
      item.quantity = 1;
      return;
    }

    if (quantity > item.product.stock) {
      item.quantity = item.product.stock;
      this.notify.error(`Stock máximo de "${item.product.name}": ${item.product.stock}.`);
      return;
    }

    item.quantity = quantity;
  }

  /** Fija el descuento entre 0 y el máximo permitido. */
  setDiscount(item: CartItem, value: number | string): void {
    const percent = Number(value);

    if (!isFinite(percent) || percent < 0) {
      item.discount = 0;
      return;
    }

    if (percent > MAX_DISCOUNT) {
      item.discount = MAX_DISCOUNT;
      this.notify.error(`El descuento máximo es ${MAX_DISCOUNT}%.`);
      return;
    }

    item.discount = round2(percent);
  }

  remove(item: CartItem): void {
    this.cart = this.cart.filter(i => i !== item);
  }

  clear(): void {
    this.cart = [];
  }

  /** Abre el resumen para que el usuario revise la venta antes de registrarla. */
  openConfirm(): void {
    if (!this.cart.length) {
      return this.notify.error('El carrito está vacío.');
    }

    this.confirmDate = new Date();
    this.confirming = true;
  }

  @HostListener('document:keydown.escape')
  cancelConfirm(): void {
    if (!this.saving) {
      this.confirming = false;
    }
  }

  /** Registra la venta; solo se llama desde el botón del modal de confirmación. */
  checkout(): void {
    if (!this.cart.length || this.saving) {
      return;
    }

    this.saving = true;
    this.saleService.create({
      user_id: environment.userId,
      items: this.cart.map(item => ({
        product_id: item.product.id,
        quantity: item.quantity,
        discount_percent: item.discount
      }))
    }).subscribe({
      next: res => {
        this.notify.success(res.message);
        this.router.navigate(['/sales']);
      },
      error: err => {
        // Se cierra el resumen para que se pueda corregir el carrito (por ejemplo, por falta de stock).
        this.saving = false;
        this.confirming = false;
        this.notify.httpError(err);
      }
    });
  }
}
