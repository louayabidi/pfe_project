import {
  Component, OnInit, AfterViewInit, HostListener,
  signal, computed, ElementRef, ViewChild, ChangeDetectionStrategy,
  ChangeDetectorRef
} from '@angular/core';
import { Router } from '@angular/router';

export interface DocSection {
  id: string;
  label: string;
  icon: string;
  children?: { id: string; label: string }[];
}

@Component({
  selector: 'app-docs',
  templateUrl: './docs.component.html',
  styleUrls: ['./docs.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DocsComponent implements OnInit, AfterViewInit {

  activeSection = signal('quickstart');
  searchQuery   = signal('');
  copiedKey     = signal<string | null>(null);
  mobileNavOpen = signal(false);

  // ── Code snippet constants ────────────────────────────────────────────────
  // Keeping these in TS avoids Angular template-parser errors caused by
  // backtick literals, escaped quotes, and multi-line strings inside
  // attribute bindings.
  readonly CODE: Record<string, string> = {
    pubspec:   `gamify_sdk: ^1.0.0`,
    pubget:    `flutter pub get`,
    curl1:
`curl -X POST https://api.gamify.io/api/events/track \\
  -H 'X-API-Key: YOUR_API_KEY' \\
  -H 'Content-Type: application/json' \\
  -d '{"userId":"user_123","eventName":"completeLevel","data":{"level":1}}'`,
    jwt:       `Authorization: Bearer eyJhbGciOiJIUzI1NiJ9...`,
    trackbody:
`{
  "userId": "user_123",
  "eventName": "completeLevel",
  "displayName": "Alice",
  "data": {
    "level": 5,
    "score": 9800,
    "status": "perfect"
  }
}`,
    regevt:    `{ "events": ["completeLevel", "purchaseItem", "login"] }`,
    'fl-init':
`import 'package:gamify_sdk/gamify_sdk.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await GamifySDK.init(apiKey: 'YOUR_API_KEY');
  runApp(const MyApp());
}`,
    'fl-track':
`final rewards = await GamifySDK.track(
  userId: currentUser.id,
  displayName: currentUser.name,
  eventName: 'completeLevel',
  data: {'level': 5, 'score': 9800},
);

if (rewards.isNotEmpty) {
  showRewardDialog(context, rewards);
}`,
  };

  readonly nav: DocSection[] = [
    {
      id: 'quickstart', label: 'Quick Start', icon: 'rocket',
      children: [
        { id: 'qs-overview',    label: 'Overview'     },
        { id: 'qs-install',     label: 'Installation' },
        { id: 'qs-first-event', label: 'First Event'  },
      ]
    },
    {
      id: 'authentication', label: 'Authentication', icon: 'key',
      children: [
        { id: 'auth-apikey', label: 'API Keys'    },
        { id: 'auth-jwt',    label: 'JWT Tokens'  },
      ]
    },
    {
      id: 'events', label: 'Events', icon: 'bolt',
      children: [
        { id: 'ev-track',    label: 'Track an Event'  },
        { id: 'ev-register', label: 'Register Events' },
        { id: 'ev-payload',  label: 'Event Payload'   },
      ]
    },
    {
      id: 'rules', label: 'Rules & Rewards', icon: 'shield',
      children: [
        { id: 'rules-simple',   label: 'Simple Rules'    },
        { id: 'rules-advanced', label: 'Advanced Rules'  },
        { id: 'rules-response', label: 'Reward Response' },
      ]
    },
    {
      id: 'badges', label: 'Badges', icon: 'badge',
      children: [
        { id: 'badges-create', label: 'Create a Badge' },
        { id: 'badges-award',  label: 'Award Logic'    },
      ]
    },
    {
      id: 'points', label: 'Points', icon: 'star',
      children: [
        { id: 'pts-balance', label: 'Balance'      },
        { id: 'pts-history', label: 'Transactions' },
      ]
    },
    {
      id: 'flutter', label: 'Flutter SDK', icon: 'flutter',
      children: [
        { id: 'fl-setup',   label: 'Setup'        },
        { id: 'fl-track',   label: 'Track Events' },
        { id: 'fl-widgets', label: 'UI Widgets'   },
      ]
    },
    {
      id: 'webhooks', label: 'Webhooks', icon: 'webhook',
      children: [
        { id: 'wh-setup',   label: 'Configuration' },
        { id: 'wh-events',  label: 'Event Types'   },
        { id: 'wh-retry',   label: 'Retry Logic'   },
      ]
    },
  ];

  filteredNav = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    if (!q) return this.nav;
    return this.nav.filter(s =>
      s.label.toLowerCase().includes(q) ||
      s.children?.some(c => c.label.toLowerCase().includes(q))
    );
  });

  constructor(private cdr: ChangeDetectorRef, private router: Router) {}

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    const options = { rootMargin: '-20% 0px -70% 0px', threshold: 0 };
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.activeSection.set(entry.target.id);
          this.cdr.markForCheck();
        }
      });
    }, options);

    document.querySelectorAll('.doc-section[id]').forEach(el => observer.observe(el));
  }

  scrollTo(id: string): void {
    this.activeSection.set(id);
    this.mobileNavOpen.set(false);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  copy(code: string, key: string): void {
    navigator.clipboard.writeText(code).then(() => {
      this.copiedKey.set(key);
      setTimeout(() => { this.copiedKey.set(null); this.cdr.markForCheck(); }, 2000);
      this.cdr.markForCheck();
    });
  }

  /** Convenience wrapper used by the template to avoid inline string literals. */
  copySnippet(key: string): void {
    this.copy(this.CODE[key] ?? '', key);
  }

  isActive(section: DocSection): boolean {
    const a = this.activeSection();
    return a === section.id || !!section.children?.some(c => c.id === a);
  }

  goToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }
}