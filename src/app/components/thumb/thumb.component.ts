import { Component, Input } from '@angular/core';

import { ImageViewerService } from '../../services/image-viewer.service';

/** Miniatura de producto: al hacer clic abre la imagen en grande. */
@Component({
  selector: 'app-thumb',
  template: `
    <button type="button" class="thumb" *ngIf="src && !broken; else empty"
      [style.width.px]="size" [style.height.px]="size"
      [title]="'Ver imagen de ' + alt" [attr.aria-label]="'Ver imagen de ' + alt"
      (click)="viewer.open(src, alt)">
      <img [src]="src" [alt]="alt" loading="lazy" (error)="broken = true">
    </button>
    <ng-template #empty>
      <span class="thumb thumb--empty" [style.width.px]="size" [style.height.px]="size" title="Sin foto">
        <i class="ri-image-line"></i>
      </span>
    </ng-template>
  `,
  styles: [`
    :host {
      display: inline-block;
      flex-shrink: 0;
      line-height: 0;
    }

    .thumb {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 0;
      overflow: hidden;
      color: var(--text-muted);
      background-color: var(--surface-3);
      border: 1px solid var(--border);
      border-radius: 8px;
    }

    button.thumb {
      cursor: zoom-in;
      transition: transform 0.15s, border-color 0.15s;

      &:hover {
        transform: scale(1.08);
        border-color: var(--accent);
      }
    }

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .thumb--empty i {
      font-size: 1.1rem;
    }
  `]
})
export class ThumbComponent {
  @Input() src: string | null | undefined;
  @Input() alt = '';
  @Input() size = 40;

  broken = false;

  constructor(public viewer: ImageViewerService) { }
}
