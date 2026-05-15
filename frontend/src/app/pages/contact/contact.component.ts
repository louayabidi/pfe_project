import {
  Component, OnInit, AfterViewInit, OnDestroy,
  ChangeDetectionStrategy, ChangeDetectorRef, NgZone
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false
})
export class ContactComponent implements OnInit, AfterViewInit, OnDestroy {

  isLoaded      = false;
  formSubmitted = false;
  isSubmitting  = false;
  submitSuccess  = false;
  submitError    = false;

  contactForm!: FormGroup;

  readonly topics = [
    { value: 'general',      label: 'General inquiry' },
    { value: 'sdk',          label: 'SDK / Integration' },
    { value: 'pricing',      label: 'Pricing & Plans' },
    { value: 'enterprise',   label: 'Enterprise' },
    { value: 'bug',          label: 'Bug report' },
    { value: 'partnership',  label: 'Partnership' },
  ];

  readonly channels = [
    {
      icon: '⚡',
      label: 'Discord',
      detail: 'Fastest response',
      href: '#',
      tag: '~2 min'
    },
    {
      icon: '📨',
      label: 'Email',
      detail: 'hello@gamifkit.io',
      href: 'mailto:hello@gamifkit.io',
      tag: '<4 hrs'
    },
    {
      icon: '🐙',
      label: 'GitHub',
      detail: 'Open an issue',
      href: '#',
      tag: 'Async'
    },
  ];

  private scrollObserver!: IntersectionObserver;

  constructor(
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef,
    private zone: NgZone
  ) {}

  ngOnInit(): void {
    this.contactForm = this.fb.group({
      name:    ['', [Validators.required, Validators.minLength(2)]],
      email:   ['', [Validators.required, Validators.email]],
      topic:   ['general'],
      message: ['', [Validators.required, Validators.minLength(10)]],
    });

    requestAnimationFrame(() => {
      this.isLoaded = true;
      this.cdr.markForCheck();
    });
  }

  ngAfterViewInit(): void {
    this.zone.runOutsideAngular(() => this.initScrollAnimations());
  }

  ngOnDestroy(): void {
    this.scrollObserver?.disconnect();
  }

  private initScrollAnimations(): void {
    this.scrollObserver = new IntersectionObserver(
      entries => entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('in-view');
          this.scrollObserver.unobserve(e.target);
        }
      }),
      { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
    );
    document.querySelectorAll<Element>('.anim')
      .forEach(el => this.scrollObserver.observe(el));
  }

  get f() { return this.contactForm.controls; }

  onSubmit(): void {
    this.formSubmitted = true;
    if (this.contactForm.invalid) return;

    this.isSubmitting = true;
    this.cdr.markForCheck();

    // Simulate API call — replace with real HTTP call
    setTimeout(() => {
      this.zone.run(() => {
        this.isSubmitting  = false;
        this.submitSuccess = true;
        this.contactForm.reset({ topic: 'general' });
        this.formSubmitted = false;
        this.cdr.markForCheck();
      });
    }, 1800);
  }
}