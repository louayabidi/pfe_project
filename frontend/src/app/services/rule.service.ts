import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Condition {
  field: string;
  operator: string;
  value: any;
}

export interface Action {
  type: 'POINTS' | 'BADGE';
  pointsAmount?: number;
  badgeId?: number;
  targetId?: number; 
}

export interface CreateRuleRequest {
  name: string;
  description?: string;
  triggerEvent: string;
  conditions: Condition[];
  actions: Action[];
  priority?: number;
  
}

export interface Rule {
  id: number;
  name: string;
  description: string;
  triggerEvent: string;
  conditions: any[];
  actions: any[];
  active: boolean;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class RuleService {
  private readonly API = `${environment.apiUrl}/api/rules`;

  constructor(private http: HttpClient) {}

  
getRules(appId: number): Observable<Rule[]> {
  return this.http.get<Rule[]>(this.API, {
    params: { appId: appId.toString() }
  });
}

createRule(appId: number, data: CreateRuleRequest): Observable<Rule> {
  return this.http.post<Rule>(this.API, data, {
    params: { appId: appId.toString() }
  });
}

  toggleRule(ruleId: number, active: boolean): Observable<Rule> {
    return this.http.patch<Rule>(`${this.API}/${ruleId}/toggle`, { active });
  }

  deleteRule(ruleId: number): Observable<void> {
    return this.http.delete<void>(`${this.API}/${ruleId}`);
  }
}