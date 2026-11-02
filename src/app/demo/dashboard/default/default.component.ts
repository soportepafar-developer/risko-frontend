import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NgApexchartsModule } from 'ng-apexcharts';
import {
  ApexAxisChartSeries,
  ApexChart,
  ApexDataLabels,
  ApexGrid,
  ApexLegend,
  ApexPlotOptions,
  ApexStroke,
  ApexXAxis
} from 'ng-apexcharts';

import { AuthService } from 'src/app/core/services/auth.service';
import { CommonsService } from 'src/app/core/services/commons.service';
import { User } from 'src/app/core/models/user';

interface Metric {
  label: string;
  value: number;
  icon: string;
  color: string;
  link: string;
  keys: string[];
}

@Component({
  selector: 'app-default',
  imports: [CommonModule, RouterLink, NgApexchartsModule],
  templateUrl: './default.component.html',
  styleUrls: ['./default.component.scss']
})
export class DefaultComponent implements OnInit {
  private authService = inject(AuthService);
  private commonsService = inject(CommonsService);
  private cdr = inject(ChangeDetectorRef);

  user: User | null = null;
  donutSeries: number[] = [0, 0, 0, 0, 0, 0];
  barSeries: ApexAxisChartSeries = [{ name: 'Total', data: [0, 0, 0, 0, 0, 0] }];

  readonly metrics: Metric[] = [
    { label: 'Procesos', value: 0, icon: 'assignment', color: '#023e8a', link: '/processes/process', keys: ['processes', 'Processes', 'procesos'] },
    { label: 'Riesgos', value: 0, icon: 'warning', color: '#e53935', link: '/risks/risk', keys: ['risks', 'Risks', 'riesgos'] },
    { label: 'Controles', value: 0, icon: 'security', color: '#2196f3', link: '/controls/control', keys: ['controls', 'Controls', 'Control', 'controles'] },
    { label: 'Eventos', value: 0, icon: 'event', color: '#fb8c00', link: '/events/event', keys: ['events', 'Events', 'eventos'] },
    { label: 'Planes', value: 0, icon: 'description', color: '#00897b', link: '/plans/plan', keys: ['plans', 'Plans', 'planes'] },
    { label: 'Evaluaciones', value: 0, icon: 'verified_user', color: '#5e35b1', link: '/evaluations/evaluation', keys: ['evaluations', 'Evaluations', 'evaluaciones'] }
  ];

  readonly labels = this.metrics.map((metric) => metric.label);
  readonly colors = this.metrics.map((metric) => metric.color);

  readonly donutChart: ApexChart = {
    type: 'donut',
    height: 320,
    fontFamily: 'inherit',
    toolbar: { show: false }
  };

  readonly donutPlot: ApexPlotOptions = {
    pie: {
      donut: {
        size: '68%',
        labels: {
          show: true,
          total: {
            show: true,
            label: 'Total',
            fontSize: '13px',
            color: '#5b6b7c'
          }
        }
      }
    }
  };

  readonly donutLegend: ApexLegend = {
    position: 'bottom',
    fontSize: '13px'
  };

  readonly donutStroke: ApexStroke = { width: 2, colors: ['#fff'] };
  readonly dataLabels: ApexDataLabels = { enabled: false };

  readonly barChart: ApexChart = {
    type: 'bar',
    height: 320,
    fontFamily: 'inherit',
    toolbar: { show: false }
  };

  readonly barPlot: ApexPlotOptions = {
    bar: {
      horizontal: true,
      borderRadius: 6,
      distributed: true,
      barHeight: '62%'
    }
  };

  barXaxis: ApexXAxis = {
    categories: this.labels,
    min: 0,
    max: 4,
    decimalsInFloat: 0,
    labels: { style: { colors: '#5b6b7c' } }
  };

  readonly barLabels: ApexDataLabels = {
    enabled: true,
    style: { colors: ['#1d2630'] },
    offsetX: 8
  };

  readonly barGrid: ApexGrid = {
    borderColor: '#eef2f6',
    strokeDashArray: 4
  };

  readonly barLegend: ApexLegend = { show: false };

  get total(): number {
    return this.metrics.reduce((sum, metric) => sum + metric.value, 0);
  }

  ngOnInit(): void {
    this.user = this.authService.currentUser;
    this.getResumen();
  }

  getResumen(): void {
    this.commonsService.getResumen().subscribe((data) => {
      const resumen = this.unwrap(data);
      for (const metric of this.metrics) {
        metric.value = this.countOf(resumen, metric.keys);
      }
      const values = this.metrics.map((metric) => metric.value);
      const peak = Math.max(...values, 0);
      this.donutSeries = values;
      this.barSeries = [{ name: 'Total', data: values }];
      this.barXaxis = {
        ...this.barXaxis,
        max: peak === 0 ? 4 : peak,
        decimalsInFloat: 0
      };
      this.cdr.detectChanges();
    });
  }

  private unwrap(data: any): any {
    const body = data?.data ?? data?.resumen ?? data;
    return Array.isArray(body) ? (body[0] ?? {}) : (body ?? {});
  }

  private countOf(source: any, keys: string[]): number {
    if (!source) {
      return 0;
    }
    for (const key of keys) {
      const value = source[key];
      if (Array.isArray(value)) {
        return value.length;
      }
      if (value !== undefined && value !== null && value !== '') {
        const count = Number(value);
        return Number.isFinite(count) ? count : 0;
      }
    }
    return 0;
  }
}
