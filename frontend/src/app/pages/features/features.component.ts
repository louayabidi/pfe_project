import { Component, OnInit } from '@angular/core';
import { trigger, transition, style, animate } from '@angular/animations';

interface Feature {
  id: string;
  icon: string;
  title: string;
  description: string;
  details: string[];
  category: string;
}

interface Category {
  name: string;
  value: string;
  icon: string;
}

interface Highlight {
  icon: string;
  title: string;
  description: string;
}

interface Integration {
  icon: string;
  name: string;
}

@Component({
  selector: 'app-features',
  templateUrl: './features.component.html',
  styleUrls: ['./features.component.scss'],
  standalone: false,
  animations: [
    trigger('fadeInUp', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(40px)' }),
        animate('0.8s 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)', 
          style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ]),
    trigger('staggerItem', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('0.6s ease-out', 
          style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ]),
    trigger('slideInRight', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateX(40px)' }),
        animate('0.7s ease-out', 
          style({ opacity: 1, transform: 'translateX(0)' }))
      ])
    ])
  ]
})
export class FeaturesComponent implements OnInit {
  selectedCategory: string = 'all';
  features: Feature[] = [];
  filteredFeatures: Feature[] = [];
  
  categories: Category[] = [
    { name: 'All Features', value: 'all', icon: '⭐' },
    { name: 'SDK & Integration', value: 'sdk', icon: '🔌' },
    { name: 'Gamification', value: 'gamification', icon: '🎮' },
    { name: 'Analytics', value: 'analytics', icon: '📊' },
    { name: 'Security', value: 'security', icon: '🔒' },
    { name: 'Developer Tools', value: 'tools', icon: '⚙️' }
  ];

  highlights: Highlight[] = [
    {
      icon: '⚡',
      title: 'Zero-Config Integration',
      description: 'Add gamification with one line of code and automatic event injection'
    },
    {
      icon: '🚀',
      title: 'Production Ready',
      description: 'Enterprise-grade infrastructure with 99.9% uptime SLA'
    },
    {
      icon: '📱',
      title: 'Cross-Platform',
      description: 'Works seamlessly across iOS, Android, and web Flutter apps'
    },
    {
      icon: '🌐',
      title: 'Global Scale',
      description: 'CDN-powered delivery with sub-100ms API response times'
    },
    {
      icon: '🔄',
      title: 'Real-Time Updates',
      description: 'WebSocket-powered instant notifications and live leaderboards'
    },
    {
      icon: '📊',
      title: 'Deep Analytics',
      description: 'Comprehensive insights into user engagement and retention'
    }
  ];

  integrations: Integration[] = [
    { icon: '🔔', name: 'Slack' },
    { icon: '🎮', name: 'Discord' },
    { icon: '📧', name: 'SendGrid' },
    { icon: '🔗', name: 'Zapier' },
    { icon: '📊', name: 'Google Analytics' },
    { icon: '💾', name: 'AWS S3' },
    { icon: '🔑', name: 'Auth0' },
    { icon: '📈', name: 'Tableau' },
    { icon: '🌐', name: 'Webhook' },
    { icon: '📱', name: 'Firebase' },
    { icon: '💼', name: 'Datadog' },
    { icon: '🔐', name: 'Okta' }
  ];

  ngOnInit(): void {
    this.initializeFeatures();
    this.filterFeatures();
  }

  private initializeFeatures(): void {
    this.features = [
      // SDK & Integration Features
      {
        id: 'one-line-init',
        icon: '🚀',
        title: 'One-Line SDK Initialization',
        description: 'Add gamification to your app with a single line of code',
        details: [
          'Drop into main.dart with GamifSDK.init()',
          'Automatic persistence with SharedPreferences',
          'Zero boilerplate required',
          'Cross-platform Flutter support'
        ],
        category: 'sdk'
      },
      {
        id: 'auto-injection',
        icon: '⚡',
        title: 'Automatic Event Injection',
        description: 'CLI scanner automatically detects and instruments your code',
        details: [
          'AST-based code analysis',
          'Detects methods like completeLevel, purchase, login',
          'Zero-risk injection by AST offset',
          'Interactive filtering & confirmation'
        ],
        category: 'sdk'
      },
      {
        id: 'widget-support',
        icon: '🎨',
        title: 'Built-In UI Widgets',
        description: 'Pre-built Flutter widgets for displaying gamification',
        details: [
          'GamifPointsWidget for real-time points',
          'Badge showcase component',
          'Leaderboard widget',
          'Fully customizable styling'
        ],
        category: 'sdk'
      },
      {
        id: 'rest-api',
        icon: '🔗',
        title: 'Comprehensive REST API',
        description: 'Full-featured API for custom integrations',
        details: [
          'JWT authentication with rotating keys',
          'Webhook support for real-time events',
          'Batch event ingestion',
          'Detailed API documentation'
        ],
        category: 'sdk'
      },

      // Gamification Features
      {
        id: 'rule-engine',
        icon: '⚙️',
        title: 'Configurable Rule Engine',
        description: 'Define complex gamification logic without coding',
        details: [
          'Visual rule builder in dashboard',
          'Support for conditions (if/then)',
          'Dynamic point calculation',
          'A/B testing for rules'
        ],
        category: 'gamification'
      },
      {
        id: 'points-badges',
        icon: '🏆',
        title: 'Points & Badge System',
        description: 'Multi-layered reward mechanism',
        details: [
          'Unlimited custom badges',
          'Dynamic point scaling',
          'Badge unlock conditions',
          'Progression tracking'
        ],
        category: 'gamification'
      },
      {
        id: 'leaderboards',
        icon: '🥇',
        title: 'Real-Time Leaderboards',
        description: 'Competitive engagement with live rankings',
        details: [
          'Global & team leaderboards',
          'WebSocket-powered real-time updates',
          'Configurable ranking criteria',
          'Time-window leaderboards (daily, weekly, monthly)'
        ],
        category: 'gamification'
      },
      {
        id: 'levels-tiers',
        icon: '📈',
        title: 'Level & Tier Systems',
        description: 'Create progression paths for users',
        details: [
          'Custom level definitions',
          'XP-based progression',
          'Tier unlocks & rewards',
          'Visual progression indicators'
        ],
        category: 'gamification'
      },

      // Analytics Features
      {
        id: 'real-time-dashboard',
        icon: '📊',
        title: 'Real-Time Analytics Dashboard',
        description: 'Live monitoring of user engagement',
        details: [
          'WebSocket-powered live event feed',
          'Real-time user activity visualization',
          'Performance metrics at a glance',
          'Custom metric creation'
        ],
        category: 'analytics'
      },
      {
        id: 'user-insights',
        icon: '👥',
        title: 'User Insights & Segmentation',
        description: 'Understand your user base in depth',
        details: [
          'User engagement scoring',
          'Retention analysis',
          'Behavioral segmentation',
          'Cohort tracking'
        ],
        category: 'analytics'
      },
      {
        id: 'event-logs',
        icon: '📝',
        title: 'Complete Event Logging',
        description: 'Full audit trail of all user activities',
        details: [
          'Detailed event logs with timestamps',
          'User action history',
          'Reward distribution records',
          'Searchable & filterable logs'
        ],
        category: 'analytics'
      },
      {
        id: 'export-reports',
        icon: '📥',
        title: 'Data Export & Reporting',
        description: 'Export data for external analysis',
        details: [
          'CSV & JSON export formats',
          'Scheduled report generation',
          'Custom metric definitions',
          'BI tool integration support'
        ],
        category: 'analytics'
      },

      // Security Features
      {
        id: 'jwt-auth',
        icon: '🔐',
        title: 'JWT Authentication',
        description: 'Secure API access with token-based auth',
        details: [
          'RS256 & HS256 algorithms',
          'Automatic token rotation',
          'Key management per application',
          'Expiration & refresh handling'
        ],
        category: 'security'
      },
      {
        id: 'cors-policy',
        icon: '🛡️',
        title: 'CORS & Rate Limiting',
        description: 'Protect your API from abuse',
        details: [
          'Configurable CORS policies',
          'Per-IP rate limiting',
          'DDoS protection',
          'Automatic threat detection'
        ],
        category: 'security'
      },
      {
        id: 'encryption',
        icon: '🔒',
        title: 'End-to-End Encryption',
        description: 'Protect sensitive user data',
        details: [
          'AES-256 data encryption at rest',
          'TLS 1.3 for transport',
          'User data anonymization',
          'GDPR compliance ready'
        ],
        category: 'security'
      },
      {
        id: 'access-control',
        icon: '👤',
        title: 'Role-Based Access Control',
        description: 'Fine-grained permission management',
        details: [
          'Admin, Team Lead, Developer roles',
          'Custom role definitions',
          'Permission-based features',
          'Audit log for access changes'
        ],
        category: 'security'
      },

      // Developer Tools
      {
        id: 'cli-scanner',
        icon: '🔍',
        title: 'CLI Code Scanner',
        description: 'Automated code instrumentation tool',
        details: [
          'Dart/Flutter AST analysis',
          'Interactive method selection',
          'Path-based filtering',
          'Dry-run preview mode'
        ],
        category: 'tools'
      },
      {
        id: 'sdk-docs',
        icon: '📚',
        title: 'Comprehensive SDK Documentation',
        description: 'Complete API reference & guides',
        details: [
          'Auto-generated API docs',
          'Code examples & snippets',
          'Video tutorials',
          'Community Q&A forum'
        ],
        category: 'tools'
      },
      {
        id: 'testing-tools',
        icon: '🧪',
        title: 'Testing & Debug Tools',
        description: 'Tools for development & testing',
        details: [
          'Flutter test support',
          'Mock event generator',
          'Offline mode simulation',
          'Debug logging & tracing'
        ],
        category: 'tools'
      },
      {
        id: 'webhooks',
        icon: '📡',
        title: 'Webhook & Custom Integrations',
        description: 'Connect with external services',
        details: [
          'Custom webhook endpoints',
          'Slack & Discord integration',
          'Zapier support',
          'IFTTT automation'
        ],
        category: 'tools'
      }
    ];
  }

  filterFeatures(): void {
    if (this.selectedCategory === 'all') {
      this.filteredFeatures = this.features;
    } else {
      this.filteredFeatures = this.features.filter(
        f => f.category === this.selectedCategory
      );
    }
  }

  selectCategory(category: string): void {
    this.selectedCategory = category;
    this.filterFeatures();
  }

  getCategoryIcon(category: string): string {
    const cat = this.categories.find(c => c.value === category);
    return cat?.icon || '⭐';
  }
}