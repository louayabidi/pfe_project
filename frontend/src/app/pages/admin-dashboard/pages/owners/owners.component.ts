import {
  Component, ChangeDetectionStrategy, OnInit, signal, computed
} from '@angular/core';
import { AdminApiService, OwnerSummary } from 'src/app/services/admin.service';

@Component({
  selector: 'app-owners',
  templateUrl: './owners.component.html',
  styleUrls: ['./owners.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OwnersComponent implements OnInit {

  owners      = signal<OwnerSummary[]>([]);
  loading     = signal(true);
  error       = signal<string | null>(null);
  search      = signal('');
  expandedId  = signal<number | null>(null);

  filtered = computed(() => {
    const q = this.search().toLowerCase().trim();
    if (!q) return this.owners();
    return this.owners().filter(o =>
      o.fullName.toLowerCase().includes(q) ||
      o.email.toLowerCase().includes(q) ||
      (o.companyName ?? '').toLowerCase().includes(q)
    );
  });

  constructor(private adminApi: AdminApiService) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.adminApi.getOwners().subscribe({
      next:  data => { this.owners.set(data); this.loading.set(false); },
      error: ()   => { this.error.set('Failed to load owners.'); this.loading.set(false); }
    });
  }

  onSearch(e: Event): void {
    this.search.set((e.target as HTMLInputElement).value);
  }

  toggleExpand(id: number): void {
    this.expandedId.set(this.expandedId() === id ? null : id);
  }

  isExpanded(id: number): boolean {
    return this.expandedId() === id;
  }

  onToggleStatus(owner: OwnerSummary, e: Event): void {
    e.stopPropagation();
    this.adminApi.toggleOwner(owner.id).subscribe({
      next: updated =>
        this.owners.update(list => list.map(o => o.id === updated.id ? updated : o))
    });
  }

  onDelete(owner: OwnerSummary, e: Event): void {
    e.stopPropagation();
    if (!confirm(`Delete owner "${owner.fullName}"? This cannot be undone.`)) return;
    this.adminApi.deleteOwner(owner.id).subscribe({
      next: () => this.owners.update(list => list.filter(o => o.id !== owner.id))
    });
  }

  initial(name: string): string {
    return (name ?? 'O').charAt(0).toUpperCase();
  }

  onVerify(owner: OwnerSummary, e: Event): void {
  e.stopPropagation();
  const verify = !owner.verified;
  this.adminApi.verifyOwner(owner.id, verify).subscribe({
    next: updated =>
      this.owners.update(list => list.map(o => o.id === updated.id ? updated : o))
  });
}
}