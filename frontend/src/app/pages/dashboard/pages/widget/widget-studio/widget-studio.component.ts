import { WidgetConfigService } from './../../../../../services/widget-config.service';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { ToastrService } from 'ngx-toastr'; // If you have toast notifications

@Component({
  selector: 'app-widget-studio',
  templateUrl: './widget-studio.component.html',
  styleUrls: ['./widget-studio.component.scss']
})
export class WidgetStudioComponent implements OnInit {
  configForm: FormGroup;
  previewMode: 'mobile' | 'web' = 'mobile';
  generatedCode: string = '';
  saving = false;
  currentAppId: number | null = null;

  // Available options
  displayModes = ['pill', 'card', 'full'];
  contentModes = ['points', 'badges', 'both'];
  languages = ['en', 'fr', 'es', 'de', 'it'];

 constructor(
  private fb: FormBuilder,
  private widgetConfigService: WidgetConfigService,
  private route: ActivatedRoute
) {
    this.configForm = this.fb.group({
      name: ['Default Widget'],
      displayMode: ['card'],
      contentMode: ['both'],
      backgroundColor: ['#6C63FF'],
      textColor: ['#FFFFFF'],
      accentColor: ['#34D399'],
      label: ['Points'],
      showLifetime: [false],
      showLevel: [true],
      animate: [true],
      borderRadius: [12],
      language: ['en']
    });
  }

 ngOnInit() {
  this.route.queryParams.subscribe(params => {
    this.currentAppId = +params['appId'] || null;
    if (this.currentAppId) this.loadExistingConfig();
  });
}

  loadExistingConfig() {
    if (!this.currentAppId) return;
    
    this.widgetConfigService.getAppConfigs(this.currentAppId).subscribe({
      next: (configs) => {
        if (configs && configs.length > 0) {
          const defaultConfig = configs[0];
          this.configForm.patchValue({
            name: defaultConfig.name,
            displayMode: defaultConfig.displayMode,
            contentMode: defaultConfig.contentMode,
            backgroundColor: defaultConfig.backgroundColor,
            textColor: defaultConfig.textColor,
            accentColor: defaultConfig.accentColor,
            label: defaultConfig.label,
            showLifetime: defaultConfig.showLifetime,
            showLevel: defaultConfig.showLevel,
            animate: defaultConfig.animate,
            borderRadius: defaultConfig.borderRadius,
            language: defaultConfig.language
          });
          this.generatedCode = `GamifWidget(apiKey: '${defaultConfig.publishableKey}')`;
        }
      },
      error: (err) => console.error('Error loading config:', err)
    });
  }

  generatePreviewKey(): string {
    return 'preview_' + Math.random().toString(36).substring(7);
  }

  updateGeneratedCode() {
    const previewKey = this.generatePreviewKey();
    this.generatedCode = `GamifWidget(apiKey: '${previewKey}')`;
  }

  saveConfig() {
    if (!this.currentAppId) {
      console.error('Error:', 'No app selected');
      return;
    }

    this.saving = true;
    this.widgetConfigService.saveConfig(this.currentAppId, this.configForm.value).subscribe({
      next: (response) => {
        this.generatedCode = response.generatedCode;
       console.log('Success:', response);
        this.saving = false;
      },
      error: (error) => {
        console.error('Error saving config:', error);
        console.error('Error:', error.error?.message || 'An error occurred while saving the widget configuration.');
        this.saving = false;
      }
    });
  }

  copyToClipboard() {
    navigator.clipboard.writeText(this.generatedCode);
    console.log('Success:');
  }

  onColorChange(color: string, field: string) {
    this.configForm.patchValue({ [field]: color });
  }
}