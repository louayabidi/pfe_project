import { Component, Input, OnChanges, SimpleChanges, AfterViewInit,
         ElementRef, ViewChild, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TimeSeriesPoint } from 'src/app/services/analytics.service';
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

@Component({
  selector: 'app-users-chart',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div style="position:relative; height:220px;">
      <canvas #canvas role="img" aria-label="Line chart of new users per day">New users over time.</canvas>
    </div>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UsersChartComponent implements OnChanges, AfterViewInit {
  @Input({ required: true }) series: TimeSeriesPoint[] = [];
  @ViewChild('canvas') canvasRef!: ElementRef<HTMLCanvasElement>;
  private chart?: Chart;

  constructor(private cdr: ChangeDetectorRef) {}

  ngAfterViewInit(): void { this.buildChart(); }
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['series'] && this.canvasRef) { this.buildChart(); }
  }

  private buildChart(): void {
    if (!this.series?.length || !this.canvasRef) return;
    const isDark = matchMedia('(prefers-color-scheme: dark)').matches;

    if (this.chart) { this.chart.destroy(); }
    this.chart = new Chart(this.canvasRef.nativeElement, {
      type: 'line',
      data: {
        labels: this.series.map(p => p.date.slice(5)),
        datasets: [{
          label: 'New users',
          data: this.series.map(p => p.value),
          borderColor: '#1D9E75',
          backgroundColor: isDark ? 'rgba(29,158,117,0.15)' : 'rgba(29,158,117,0.08)',
          fill: true, tension: 0.4,
          pointBackgroundColor: '#1D9E75', pointRadius: 3,
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { display: false }, ticks: { color: isDark?'#aaa':'#888', font: { size: 10 } } },
          y: { grid: { color: isDark?'rgba(255,255,255,0.06)':'rgba(0,0,0,0.06)' },
               ticks: { color: isDark?'#aaa':'#888', font: { size: 10 } }, beginAtZero: true }
        }
      }
    });
    this.cdr.markForCheck();
  }
}