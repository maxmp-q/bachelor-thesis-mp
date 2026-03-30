import {AfterViewInit, Component, computed, effect, input, OnDestroy, signal} from '@angular/core';
import { ScoredData, Separation} from '../../../../shared/interface/data-point';
import {DataHelper, getAverage, getMedian} from '../../../../shared/data-helper';
import {Chart, ChartConfiguration, ChartType} from 'chart.js';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {updateChart} from '../../../utilities/utility';

@Component({
  selector: 'app-field-bar-plot',
  imports: [
    ReactiveFormsModule,
    FormsModule
  ],
  templateUrl: './field-bar-plot.html',
  styleUrl: './field-bar-plot.scss',
})
export class FieldBarPlot implements AfterViewInit, OnDestroy{
  dataPoints = signal<Record<string, ScoredData>>(DataHelper.getScoredData());

  key = input<keyof ScoredData>('clone_coverage');
  sub_key = input<keyof Separation | undefined>();

  showAverage = signal<boolean>(true);
  chart = signal<Chart | null>(null);
  chartConfig = computed(()=> {
    const dataPoints = this.dataPoints();
    const key = this.key();
    const showAvg = this.showAverage();

    const values: Record<string, number[]> = {};

    Object.values(dataPoints).forEach((data) => {
      type Entry = typeof data;
      type Key = typeof key;
      type SubKey = keyof Entry[Key];

      const subKey = this.sub_key() as SubKey | undefined;

      const field = data.field;
      const value = Number(DataHelper.getValue(data, key, subKey))

      values[field] ??= [];

      const current = values[field];

      values[field] = [...current, value];
    });

    const labels: string[] = [];
    const data: number[] = [];

    Object.entries(values).forEach(([field, entry]) => {
      labels.push(`${field} (count: ${entry.length})`);
      data.push(showAvg ? getAverage(entry) : getMedian(entry));
    });

    const backgroundColors = labels.map(label =>
      label.startsWith('nonSci')
        ? 'rgba(255, 99, 132, 0.6)'
        : 'rgba(54, 162, 235, 0.6)'
    );

    const borderColors = labels.map(label =>
      label.startsWith('nonSci')
        ? 'rgba(255, 99, 132, 1)'
        : 'rgba(54, 162, 235, 1)'
    );

    const config: ChartConfiguration = {
      type: 'bar' as ChartType,
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Field Average',
            data: data,
            backgroundColor: backgroundColors,
            borderColor: borderColors,
            borderWidth: 1
          }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'top' },
          title: {
            display: true,
            text: `Different Fields in ${key} ${this.sub_key() ?? ''}`
          }
        },
        scales: {
          y: {
            title: {
              display: true,
              text: `${key} ${this.sub_key() ?? ''} ${showAvg ? 'average' : 'median'}`
            }
          }
        }
      }
    };
    return config;
  });


  constructor() {
    effect(() => {
      const config = this.chartConfig();
      const chart = this.chart();

      updateChart(chart, config);
    });
  }


  ngAfterViewInit() {
    this.createScoringByField();
  }

  /**
   * Creates a bar chart where the average
   * or median of key is displayed by different
   * fields.
   * @private
   */
  private createScoringByField(): void {
    const canvas = document.getElementById(`FieldBy${this.key()}BarChart`) as HTMLCanvasElement;
    if (canvas) this.chart.set(new Chart(canvas, this.chartConfig()));
  }


  ngOnDestroy() {
    const chart = this.chart();
    if(chart) chart.destroy();
  }
}
