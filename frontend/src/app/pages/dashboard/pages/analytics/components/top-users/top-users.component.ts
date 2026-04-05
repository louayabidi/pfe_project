import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CategoryPoint } from 'src/app/services/analytics.service';

@Component({
  selector: 'app-top-users',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './top-users.component.html',
  styleUrls: ['./top-users.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TopUsersComponent {
  @Input({ required: true }) items!: CategoryPoint[];

  getInitials(label: string): string {
    return label
      .split(' ')
      .map(word => word[0]?.toUpperCase())
      .join('')
      .slice(0, 2) || 'U';
  }
}