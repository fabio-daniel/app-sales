import { Component, HostListener } from '@angular/core';

import { ImageViewerService } from '../../services/image-viewer.service';

/** Visor global de imágenes: se cierra con clic fuera, con la X o con Esc. */
@Component({
  selector: 'app-image-viewer',
  template: `
    <div class="viewer" *ngIf="viewer.current as image" role="dialog" aria-modal="true"
      [attr.aria-label]="image.caption" (click)="viewer.close()">
      <figure (click)="$event.stopPropagation()">
        <button type="button" class="viewer__close" title="Cerrar" aria-label="Cerrar" (click)="viewer.close()">
          <i class="ri-close-line"></i>
        </button>
        <img [src]="image.src" [alt]="image.caption">
        <figcaption>{{ image.caption }}</figcaption>
      </figure>
    </div>
  `,
  styles: [`
    .viewer {
      position: fixed;
      inset: 0;
      z-index: 2000;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1.5rem;
      background-color: rgba(2, 6, 23, 0.85);
      backdrop-filter: blur(4px);
      cursor: zoom-out;
      animation: fade 0.15s ease-out;
    }

    figure {
      position: relative;
      margin: 0;
      max-width: min(92vw, 960px);
      cursor: default;
    }

    img {
      display: block;
      max-width: 100%;
      max-height: 78vh;
      margin: 0 auto;
      object-fit: contain;
      background-color: var(--surface);
      border-radius: 12px;
      box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
    }

    figcaption {
      margin-top: 0.75rem;
      text-align: center;
      font-size: 0.9rem;
      font-weight: 600;
      color: #f1f5f9;
    }

    .viewer__close {
      position: absolute;
      top: -0.75rem;
      right: -0.75rem;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 34px;
      height: 34px;
      padding: 0;
      font-size: 1.25rem;
      color: #0f172a;
      background-color: #fff;
      border: 0;
      border-radius: 50%;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);

      &:hover {
        background-color: #e2e8f0;
      }
    }

    @keyframes fade {
      from {
        opacity: 0;
      }
    }
  `]
})
export class ImageViewerComponent {
  constructor(public viewer: ImageViewerService) { }

  @HostListener('document:keydown.escape', ['$event'])
  onEscape(event: Event): void {
    if (this.viewer.current) {
      // Evita que Esc cierre también un modal que esté debajo de la imagen.
      event.stopImmediatePropagation();
      this.viewer.close();
    }
  }
}
