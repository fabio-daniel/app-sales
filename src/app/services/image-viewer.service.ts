import { Injectable } from '@angular/core';

export interface ViewerImage {
  src: string;
  caption: string;
}

@Injectable({ providedIn: 'root' })
export class ImageViewerService {
  current: ViewerImage | null = null;

  open(src: string, caption: string): void {
    this.current = { src, caption };
  }

  close(): void {
    this.current = null;
  }
}
