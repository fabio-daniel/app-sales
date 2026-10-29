import { Injectable } from '@angular/core';

export type Theme = 'light' | 'dark';

const STORAGE_KEY = 'app-sales-theme';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  theme: Theme = this.initialTheme();

  constructor() {
    this.apply(this.theme);
  }

  set(theme: Theme): void {
    this.theme = theme;
    localStorage.setItem(STORAGE_KEY, theme);
    this.apply(theme);
  }

  private initialTheme(): Theme {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved === 'dark' ? 'dark' : 'light';
  }

  /** Marca el <html> para que Bootstrap y las variables CSS cambien de aspecto. */
  private apply(theme: Theme): void {
    const root = document.documentElement;
    root.setAttribute('data-theme', theme);
    root.setAttribute('data-bs-theme', theme);
  }
}
