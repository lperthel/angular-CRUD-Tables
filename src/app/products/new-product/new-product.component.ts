import { FormsModule, NgForm } from '@angular/forms';
import { Product } from '../product/product.model';
import { ProductService } from '../product/product.service';
import { UUID } from 'angular2-uuid';
import { Router } from '@angular/router';
import {
  Component,
  OnInit,
  signal,
  TemplateRef,
  viewChild,
  WritableSignal,
} from '@angular/core';

import {
  ModalDismissReasons,
  NgbDatepickerModule,
  NgbModal,
} from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-new-product',
  imports: [FormsModule],
  templateUrl: './new-product.component.html',
  styleUrl: './new-product.component.css',
})
export class NewProductComponent implements OnInit {
  modal = viewChild.required<TemplateRef<any>>('content');
  closeResult: WritableSignal<string> = signal('');
  serverErrorMessage: string =
    'Error occured while trying to contact server. Please contact customer support.';
  serverError = signal<string>('');
  newProductForm = viewChild.required<NgForm>('newProductForm');

  constructor(
    private modalService: NgbModal,
    private productService: ProductService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.openModal(this.modal());
  }

  openModal(content: TemplateRef<any>) {
    this.modalService
      .open(content, { ariaLabelledBy: 'modal-basic-title' })
      .result.then(
        (result) => {
          this.closeResult.set(`Closed with: ${result}`);
          this.createProduct();
          this.router.navigateByUrl('/');
        },
        (reason) => {
          this.router.navigateByUrl('/');
        }
      );
  }

  createProduct() {
    if (this.newProductForm().form.invalid) {
      return;
    }

    console.log(this.newProductForm().form);
    const product: Product = {
      id: UUID.UUID(),
      name: this.newProductForm().value.name || '',
      description: this.newProductForm().value.description || '',
      price: this.newProductForm().value.price || '',
      quantity: parseInt(this.newProductForm().value.quantity || '0', 10),
    };
    const sub = this.productService.createProduct(product).subscribe({
      next: (val) => {
        this.serverError.set('');
        this.modalService.dismissAll('save-click');
        this.productService.products.update((oldProducts) => [
          ...oldProducts,
          product,
        ]);
      },
      error: (err) => {
        this.serverError.set(this.serverErrorMessage);
      },
    });
    this.productService.closeConnection(sub);
  }
  onCancel() {
    this.router.navigateByUrl('/');
  }
}
