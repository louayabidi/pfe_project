import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateAppComponent } from './create-app.component';

describe('CreateAppComponent', () => {
  let component: CreateAppComponent;
  let fixture: ComponentFixture<CreateAppComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CreateAppComponent]
    });
    fixture = TestBed.createComponent(CreateAppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
