/**
 * ============================================================================
 * APP CHOOSER COMPONENT
 * ============================================================================
 * Shows when user has multiple apps but hasn't selected one yet.
 * Displayed on Rules, Badges, Events pages during initialization.
 * 
 * Location: src/app/pages/dashboard/components/app-chooser/app-chooser.component.ts
 */

import { Component, ChangeDetectionStrategy } from '@angular/core';
import { AppStateService } from 'src/app/services/app-state.service';

@Component({
  selector: 'app-chooser',
  template: `
    <div class="choose-state"
         *ngIf="appState.apps().length > 1 && !appState.currentAppId()">
      
      <div class="choose-content">
        <span class="choose-icon">📱</span>
        <h3 class="choose-title">Choisissez une application</h3>
        <p class="choose-sub">
          Sélectionnez une application pour voir ses {{ entityType }}
        </p>
        
        <div class="choose-apps">
          <button
            *ngFor="let app of appState.apps()"
            class="choose-app-btn"
            (click)="selectApp(app.id)"
            type="button">
            <span class="choose-app-icon">🎯</span>
            <span class="choose-app-name">{{ app.name }}</span>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M5 3l4 4-4 4" stroke="currentColor"
                    stroke-width="1.5" stroke-linecap="round"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .choose-state {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 60vh;
      padding: 40px 20px;
    }

    .choose-content {
      text-align: center;
    }

    .choose-icon {
      display: block;
      font-size: 56px;
      margin-bottom: 20px;
      opacity: 0.8;
    }

    .choose-title {
      font-size: 24px;
      font-weight: 700;
      color: var(--text-1);
      margin: 0 0 8px;
    }

    .choose-sub {
      font-size: 14px;
      color: var(--text-2);
      margin: 0 0 28px;
    }

    .choose-apps {
      display: flex;
      flex-direction: column;
      gap: 12px;
      max-width: 400px;
      margin: 0 auto;
    }

    .choose-app-btn {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 14px 18px;
      background: var(--surface-2);
      border: 1px solid var(--border);
      border-radius: var(--radius-sm);
      color: var(--text-1);
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: all var(--t);
      text-align: left;
    }

    .choose-app-btn:hover {
      background: var(--surface-3);
      border-color: var(--border-active);
      transform: translateX(4px);
    }

    .choose-app-icon {
      font-size: 18px;
      flex-shrink: 0;
    }

    .choose-app-name {
      flex: 1;
    }

    .choose-app-btn svg {
      color: var(--text-3);
      transition: transform var(--t);
    }

    .choose-app-btn:hover svg {
      transform: translateX(2px);
      color: var(--accent);
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppChooserComponent {
  readonly entityType = 'configur'; // Will be overridden by parent context

  constructor(readonly appState: AppStateService) {}

  selectApp(appId: number): void {
    this.appState.selectApp(appId);
  }
}