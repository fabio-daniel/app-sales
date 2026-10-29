import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import Toastify from 'toastify-js';

@Injectable({ providedIn: 'root' })
export class NotifyService {
  success(text: string): void {
    this.show(text, '#198754');
  }

  error(text: string): void {
    this.show(text, '#FB2E2E');
  }

  /** Extrae el mensaje más útil de una respuesta de error de la API. */
  httpError(err: HttpErrorResponse): void {
    if (err.status === 0) {
      return this.error('No se pudo conectar con la API. Verifica que el servidor esté en marcha.');
    }

    const errors = err.error?.errors as Record<string, string[] | string> | undefined;
    if (errors) {
      const first = Object.values(errors)[0];
      return this.error(Array.isArray(first) ? first[0] : first);
    }

    this.error(err.error?.message ?? 'Ocurrió un error inesperado.');
  }

  private show(text: string, background: string): void {
    Toastify({
      text,
      duration: 4000,
      gravity: 'top',
      position: 'right',
      close: true,
      style: { background }
    }).showToast();
  }
}
