import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
 
// ── Types ──────────────────────────────────────────────────────────────────
 
export type ConditionType = 'EVENT' | 'EVENT_COUNT' | 'TIME_PERIOD' | 'DATA_FIELD';
export type OperatorType  =
  'EQUALS' | 'NOT_EQUALS' | 'GREATER_THAN' | 'LESS_THAN' |
  'GREATER_THAN_OR_EQUAL' | 'LESS_THAN_OR_EQUAL' | 'CONTAINS' | 'WITHIN';
export type ActionType    = 'POINTS' | 'BADGE' | 'MULTIPLIER' | 'CUSTOM';
export type PeriodValue   = '1_HOUR' | '1_DAY' | '7_DAYS' | '30_DAYS';
 
export interface AdvancedCondition {
  type:     ConditionType;
  field?:   string;
  operator: OperatorType;
  value:    string | number;
}
 
export interface AdvancedAction {
  type:        ActionType;
  value:       string | number;
  description?: string;
  params?:     Record<string, unknown>;
}
 
export interface CreateAdvancedRuleRequest {
  name:            string;
  description?:    string;
  triggerEvents: string[];
  conditionLogic:  'AND' | 'OR';
  conditions:      AdvancedCondition[];
  actions:         AdvancedAction[];
  priority?:       number;
  cooldownMinutes?: number;
  maxAwardsPerUser?: number;
}
 
export interface AdvancedRule extends CreateAdvancedRuleRequest {
  id:               number;
  active:           boolean;
  triggerCount?:     number;
  lastTriggeredAt?: string;
  createdAt:        string;

}
 
// ── Modèles prédéfinis ─────────────────────────────────────────────────────
 
export interface RuleTemplate {
  label:       string;
  description: string;
  icon:        string;
  rule:        Partial<CreateAdvancedRuleRequest>;
}
 
export const RULE_TEMPLATES: RuleTemplate[] = [
  {
    label: 'Login fidèle (3x)',
    description: '3 connexions → récompense',
    icon: '🔑',
    rule: {
      conditionLogic: 'AND',
      conditions: [
        { type: 'EVENT_COUNT', field: 'login', operator: 'GREATER_THAN_OR_EQUAL', value: 3 }
      ],
      actions: [{ type: 'POINTS', value: 100, description: '+100 points fidélité' }]
    }
  },
  {
    label: 'Login + Achat',
    description: 'Login ET achat le même jour',
    icon: '🛒',
    rule: {
      conditionLogic: 'AND',
      conditions: [
        { type: 'EVENT',       field: 'login',    operator: 'EQUALS', value: 'login' },
        { type: 'EVENT',       field: 'purchase', operator: 'EQUALS', value: 'purchase' },
        { type: 'TIME_PERIOD', field: 'window',   operator: 'WITHIN', value: '1_DAY' }
      ],
      actions: [{ type: 'POINTS', value: 200, description: '+200 points combo' }]
    }
  },
  {
    label: '10 actions consécutives',
    description: 'N\'importe quelle action 10x',
    icon: '🔥',
    rule: {
      conditionLogic: 'AND',
      conditions: [
        { type: 'EVENT_COUNT', field: 'action', operator: 'GREATER_THAN_OR_EQUAL', value: 10 }
      ],
      actions: [
        { type: 'BADGE',  value: 1,   description: 'Badge Assidu' },
        { type: 'POINTS', value: 500, description: '+500 points streak' }
      ]
    }
  },
  {
    label: 'Achat premium',
    description: 'Montant > 100€ → badge',
    icon: '💎',
    rule: {
      conditionLogic: 'AND',
      conditions: [
        { type: 'DATA_FIELD', field: 'amount', operator: 'GREATER_THAN', value: 100 }
      ],
      actions: [{ type: 'BADGE', value: 2, description: 'Badge Client Premium' }]
    }
  },
  {
    label: 'Multiplicateur hebdo',
    description: 'x2 points pendant 7 jours',
    icon: '⚡',
    rule: {
      conditionLogic: 'AND',
      conditions: [
        { type: 'TIME_PERIOD', field: 'window', operator: 'WITHIN', value: '7_DAYS' }
      ],
      actions: [{ type: 'MULTIPLIER', value: 2.0, description: 'Double points cette semaine' }],
      cooldownMinutes: 10080 // 1 semaine
    }
  }
];

 
@Injectable({ providedIn: 'root' })
export class AdvancedRuleService {
  private readonly API = `${environment.apiUrl}/api/rules/advanced`;
  private cache = new Map<number, AdvancedRule[]>();
 
  constructor(private http: HttpClient) {}
 
  getRules(appId: number): Observable<AdvancedRule[]> {
    if (this.cache.has(appId)) return of(this.cache.get(appId)!);
    const params = new HttpParams().set('appId', appId);
    return this.http.get<AdvancedRule[]>(this.API, { params }).pipe(
      tap(rules => this.cache.set(appId, rules)),
      catchError(() => of([]))
    );
  }
 
  createRule(appId: number, data: CreateAdvancedRuleRequest): Observable<AdvancedRule> {
    const params = new HttpParams().set('appId', appId);
    return this.http.post<AdvancedRule>(this.API, data, { params }).pipe(
      tap(() => this.cache.delete(appId))
    );
  }
 
  toggleRule(ruleId: number, active: boolean, appId: number): Observable<AdvancedRule> {
    const params = new HttpParams().set('appId', appId);
    return this.http.patch<AdvancedRule>(`${this.API}/${ruleId}/toggle`, { active }, { params }).pipe(
      tap(() => this.cache.delete(appId))
    );
  }
 
  deleteRule(ruleId: number, appId: number): Observable<void> {
    const params = new HttpParams().set('appId', appId);
    return this.http.delete<void>(`${this.API}/${ruleId}`, { params }).pipe(
      tap(() => this.cache.delete(appId))
    );
  }
 
  getTemplates(): RuleTemplate[] { return RULE_TEMPLATES; }
  clearCache(): void { this.cache.clear(); }
}
