import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewProductComponent } from '../product-form.model';

describe('NewProductComponent', () => {
  let component: NewProductComponent;
  let fixture: ComponentFixture<NewProductComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewProductComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(NewProductComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
