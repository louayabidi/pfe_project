/**
 * ============================================================================
 * APP SELECTOR COMPONENT
 * ============================================================================
 * Reusable app selector dropdown used across Rules, Badges, Events pages.
 * Shows only when multiple apps exist and one needs to be selected.
 * 
 * Location: src/app/pages/dashboard/components/app-selector/app-selector.component.ts
 */

import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { AppStateService } from 'src/app/services/app-state.service';

@Component({
  selector: 'app-selector',
  template: `
    <!-- Only show if multiple apps exist and one is selected -->
    <div class="app-selector-wrapper"
         *ngIf="appState.hasMultipleApps() && appState.currentAppId()">
      
      <label class="selector-label">Application</label>
      
      <div class="select-wrapper">
        <select class="app-select"
                [value]="appState.currentAppId()"
                (change)="onAppChange($event)"
                [disabled]="appState.loading()">
          <option value="">Choose from your apps</option>
          <option *ngFor="let app of appState.apps()" [value]="app.id">
            {{ app.name }}
          </option>
        </select>
        <svg class="select-icon" width="12" height="12" viewBox="0 0 12 12">
          <path d="M2 4l4 4 4-4" stroke="currentColor" stroke-width="1.5"
                fill="none" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>
    </div>
  `,
 styles: [`
  :host {
    --bg:            #080c10;
    --surface:       #0e1318;
    --surface-2:     #141b22;
    --surface-3:     #1b242e;
    --border:        rgba(100,200,255,0.08);
    --border-active: rgba(100,200,255,0.18);
    --accent:        #00d4ff;
    --text-1:        #e8f4ff;
    --text-2:        #7a9db8;
    --sans:          'Outfit', sans-serif;
    --radius-sm:     8px;
    --t:             0.18s cubic-bezier(0.4,0,0.2,1);
  }
  .app-selector-wrapper {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .selector-label {
    font-size: 12px;
    font-weight: 500;
    color: var(--text-2);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
  .select-wrapper {
    position: relative;
    display: inline-block;
  }
  .app-select {
    padding: 8px 12px;
    padding-right: 28px;
    background: var(--surface-2);
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    color: var(--text-1);
    font-size: 13px;
    font-family: var(--sans);
    cursor: pointer;
    transition: all var(--t);
    appearance: none;
    -webkit-appearance: none;
    -moz-appearance: none;
  }
  .app-select option {
    background: var(--surface-2);
    color: var(--text-1);
  }
  .app-select:hover:not(:disabled) {
    border-color: var(--border-active);
    background: var(--surface-3);
  }
  .app-select:focus {
    outline: none;
    border-color: var(--accent);
    box-shadow: 0 0 0 2px rgba(0,212,255,0.1);
  }
  .app-select:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  .select-icon {
    position: absolute;
    top: 50%;
    right: 8px;
    transform: translateY(-50%);
    pointer-events: none;
    color: var(--text-2);
  }
`],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppSelectorComponent implements OnInit {
  constructor(readonly appState: AppStateService) {}

  ngOnInit(): void {
    // Component initializes with app state already loaded
  }

  onAppChange(event: Event): void {
    const appId = Number((event.target as HTMLSelectElement).value);
    if (appId) {
      this.appState.selectApp(appId);
    }
  }
}