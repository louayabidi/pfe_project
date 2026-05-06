import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GamifPageBuilderComponent } from './gamif-page-builder.component';

describe('GamifPageBuilderComponent', () => {
  let component: GamifPageBuilderComponent;
  let fixture: ComponentFixture<GamifPageBuilderComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [GamifPageBuilderComponent]
    });
    fixture = TestBed.createComponent(GamifPageBuilderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
