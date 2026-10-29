import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es';
import { FormsModule, ReactiveFormsModule } from '@angular/forms'

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './components/home/home.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { ProductsComponent } from './components/products/products.component';
import { SalesComponent } from './components/sales/sales.component';
import { SaleFormComponent } from './components/sale-form/sale-form.component';
import { MoneyPipe } from './pipes/money.pipe';
import { ThumbComponent } from './components/thumb/thumb.component';
import { ImageViewerComponent } from './components/image-viewer/image-viewer.component';
import { PaginatorComponent } from './components/paginator/paginator.component';

// Solo para el pipe date con locale 'es' (los números siguen en formato 1,234.56)
registerLocaleData(localeEs);

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    NavbarComponent,
    ProductsComponent,
    SalesComponent,
    SaleFormComponent,
    MoneyPipe,
    ThumbComponent,
    ImageViewerComponent,
    PaginatorComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
