import { HttpClient, HttpHeaders } from '@angular/common/http';
import { DestroyRef, Injectable, signal } from '@angular/core';
import { catchError, Observable, Subscription, throwError } from 'rxjs';
import { Product } from './product.model';

@Injectable({ providedIn: 'root' })
export class ProductService {
  apiServer = 'http://localhost:3000';
  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
    }),
  };

  products = signal<Product[]>([]);

  constructor(private httpClient: HttpClient, private destroyRef: DestroyRef) {}

  createProduct(product: Product): Observable<Product> {
    const backupProducts = this.products();
    this.products.update((products) => [...products, product]);

    return this.httpClient
      .post<Product>(
        this.apiServer + '/products/',
        JSON.stringify(product),
        this.httpOptions
      )
      .pipe(
        catchError((err) => {
          this.products.set(backupProducts);
          return throwError(
            () => new Error('REST call to create new product failed.')
          );
        })
      );
  }

  get requestAllProducts(): Observable<Product[]> {
    return this.httpClient
      .get<Product[]>(this.apiServer + '/products/', this.httpOptions)
      .pipe(
        catchError((err) => {
          return throwError(
            () => new Error('REST call to get all products failed')
          );
        })
      );
  }

  deletProduct(productId: string): Observable<string> {
    const backupProducts = this.products();

    this.products.update((oldProducts) =>
      oldProducts.filter((product) => product.id != productId)
    );

    return this.httpClient
      .delete<string>(
        this.apiServer + '/products/' + productId,
        this.httpOptions
      )
      .pipe(
        catchError((err) => {
          this.products.set(backupProducts);
          return throwError(
            () => new Error('REST call to delete product failed')
          );
        })
      );
  }

  updateProduct(newProduct: Product): Observable<unknown> {
    const backupProducts = this.products();

    this.products.update((products) => {
      return products.map((oldProduct) => {
        if (oldProduct.id === newProduct.id) {
          return newProduct;
        } else {
          return oldProduct;
        }
      });
    });

    return this.httpClient
      .put<Product>(
        this.apiServer + '/products/' + newProduct.id,
        newProduct,
        this.httpOptions
      )
      .pipe(
        catchError((error) => {
          this.products.set(backupProducts);
          return throwError(
            () => new Error('Rest call to update products failed.')
          );
        })
      );
  }

  closeConnection(sub: Subscription) {
    this.destroyRef.onDestroy(() => sub.unsubscribe());
  }
}
