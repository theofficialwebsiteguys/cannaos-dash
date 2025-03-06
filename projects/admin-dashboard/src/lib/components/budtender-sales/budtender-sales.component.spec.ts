import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BudtenderSalesComponent } from './budtender-sales.component';

describe('BudtenderSalesComponent', () => {
  let component: BudtenderSalesComponent;
  let fixture: ComponentFixture<BudtenderSalesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BudtenderSalesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BudtenderSalesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
