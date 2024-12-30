import {
  Component,
  input,
  OnInit,
  TemplateRef,
  viewChild,
} from '@angular/core';
import { Product } from '../product/product.model';
import { ProductService } from '../product/product.service';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-update-product',
  imports: [ReactiveFormsModule],
  templateUrl: './update-product.component.html',
  styleUrl: './update-product.component.css',
})
export class UpdateProductComponent implements OnInit {
  productId = input.required<string>();
  private product!: Product;
  foundProduct: Product | undefined;
  form!: FormGroup;
  writeFailed: boolean;
  modal = viewChild.required<TemplateRef<any>>('content');

  constructor(
    private productService: ProductService,
    private router: Router,
    private modalService: NgbModal
  ) {
    this.writeFailed = false;
  }

  ngOnInit() {
    console.log(`productId: ${this.productId}`);
    this.foundProduct = this.productService
      .products()
      .find((product) => this.productId() === product.id);

    if (!this.foundProduct) {
      console.error('could not get product for id ' + this.productId);
    } else {
      this.product = this.foundProduct;
      this.form = new FormGroup({
        name: new FormControl(this.product.name),
        description: new FormControl(this.product.description),
        price: new FormControl(this.product.price),
        quantity: new FormControl(this.product.quantity),
      });
    }
    this.open(this.modal());
  }

  open(content: TemplateRef<any>) {
    this.modalService
      .open(content, { ariaLabelledBy: 'modal-basic-title' })
      .result.then(
        (result) => {
          this.createProduct();
          this.router.navigateByUrl('/');
        },
        (reason) => {
          this.router.navigateByUrl('/');
        }
      );
  }

  createProduct() {
    const newProduct: Product = {
      id: this.product.id,
      name: this.form.value.name,
      description: this.form.value.description,
      price: this.form.value.price,
      quantity: parseInt(this.form.value.quantity),
    };

    const subscription = this.productService
      .updateProduct(newProduct)
      .subscribe({
        error: (err) => {
          this.writeFailed = true;
          console.log(err);
        },
      });

    this.productService.closeConnection(subscription);

    if (this.writeFailed) {
      this.writeFailed = false;
    } else {
      this.productService.products.set(
        this.productService.products().map((oldProduct) => {
          if (oldProduct.id === this.product.id) return newProduct;
          else return oldProduct;
        })
      );
    }

    this.router.navigateByUrl('/');
  }
}
