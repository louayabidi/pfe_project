import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateRuleComponent } from './create-rule.component';

describe('CreateRuleComponent', () => {
  let component: CreateRuleComponent;
  let fixture: ComponentFixture<CreateRuleComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CreateRuleComponent]
    });
    fixture = TestBed.createComponent(CreateRuleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
