import { Component, Input, OnChanges, SimpleChanges, AfterViewInit, ElementRef, ViewChild, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TimeSeriesPoint } from 'src/app/services/analytics.service';
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

@Component({
  selector: 'app-events-chart',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div style="position:relative; height:220px;">
      <canvas #canvas role="img" aria-label="Bar chart of daily event counts">Events over time.</canvas>
    </div>
    <div *ngIf="peakDate" class="peak-hint">
      Peak: <strong>{{ peakDate }}</strong> — {{ peakValue }} events
    </div>`,
  styles: [`.peak-hint { font-size: 11px; color: var(--color-text-secondary); margin-top: 8px; text-align: right; }`],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EventsChartComponent implements OnChanges, AfterViewInit {
  @Input({ required: true }) series: TimeSeriesPoint[] = [];
  @ViewChild('canvas') canvasRef!: ElementRef<HTMLCanvasElement>;

  private chart?: Chart;
  peakDate = '';
  peakValue = 0;

  constructor(private cdr: ChangeDetectorRef) {}

  ngAfterViewInit(): void { this.buildChart(); }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['series'] && this.canvasRef) { this.buildChart(); }
  }

  private buildChart(): void {
    if (!this.series?.length || !this.canvasRef) return;

    const maxVal = Math.max(...this.series.map(p => p.value));
    const peak = this.series.find(p => p.value === maxVal)!;
    this.peakDate = peak.date.slice(5);
    this.peakValue = peak.value;

    const isDark = matchMedia('(prefers-color-scheme: dark)').matches;
    const gridColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';
    const textColor = isDark ? '#aaa' : '#888';

    if (this.chart) { this.chart.destroy(); }
    this.chart = new Chart(this.canvasRef.nativeElement, {
      type: 'bar',
      data: {
        labels: this.series.map(p => p.date.slice(5)),
        datasets: [{
          label: 'Events',
          data: this.series.map(p => p.value),
          backgroundColor: this.series.map(p =>
            p.value === maxVal ? '#534AB7' : (isDark ? '#3C3489' : '#AFA9EC')),
          borderRadius: 4,
          borderSkipped: false,
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { display: false }, ticks: { color: textColor, font: { size: 10 } } },
          y: { grid: { color: gridColor }, ticks: { color: textColor, font: { size: 10 } }, beginAtZero: true }
        }
      }
    });
    this.cdr.markForCheck();
  }
}