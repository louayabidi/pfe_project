import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WidgetStudioComponent } from './widget-studio.component';

describe('WidgetStudioComponent', () => {
  let component: WidgetStudioComponent;
  let fixture: ComponentFixture<WidgetStudioComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [WidgetStudioComponent]
    });
    fixture = TestBed.createComponent(WidgetStudioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
