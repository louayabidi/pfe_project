import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AiEngineComponent } from './ai-engine.component';

describe('AiEngineComponent', () => {
  let component: AiEngineComponent;
  let fixture: ComponentFixture<AiEngineComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AiEngineComponent]
    });
    fixture = TestBed.createComponent(AiEngineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
