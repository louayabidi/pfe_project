import { Component } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent {

  currentYear = new Date().getFullYear();

  constructor(private sanitizer: DomSanitizer) {}

  sanitize(html: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  readonly socialLinks = [
  { label: 'Twitter / X', url: 'https://twitter.com', icon: 'twitter' },
  { label: 'GitHub',      url: 'https://github.com',  icon: 'github'  },
  { label: 'LinkedIn',    url: 'https://linkedin.com', icon: 'linkedin' },
];

  readonly productLinks = [
    { label: 'Features',  path: '/features'  },
    { label: 'Pricing',   path: '/pricing'   },
    { label: 'SDK Docs',  path: '/docs'      },
    { label: 'Changelog', path: '/changelog' },
  ];

  readonly companyLinks = [
    { label: 'About',   path: '/about'   },
    { label: 'Blog',    path: '/blog'    },
    { label: 'Careers', path: '/careers' },
    { label: 'Contact', path: '/contact' },
  ];

  readonly legalLinks = [
    { label: 'Privacy', path: '/privacy' },
    { label: 'Terms',   path: '/terms'   },
    { label: 'DPA',     path: '/dpa'     },
  ];
}