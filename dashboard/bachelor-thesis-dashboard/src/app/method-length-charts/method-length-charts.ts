import {AfterViewInit, Component, OnDestroy, signal} from '@angular/core';
import {ScatterPlot} from "../charts/scatter-plot/scatter-plot";
import {AnalyzedData, Separation} from '../../../shared/interface/data-point';
import {DataHelper} from '../../../shared/data-helper';
import {Chart, ChartConfiguration, ChartType} from 'chart.js';

@Component({
  selector: 'app-method-length-charts',
    imports: [
        ScatterPlot
    ],
  templateUrl: './method-length-charts.html',
  styleUrl: './method-length-charts.scss',
})
export class MethodLengthCharts implements AfterViewInit, OnDestroy  {
  dataPoints = signal<Record<string, AnalyzedData>>(DataHelper.getData);

  allNonReactivePlots = signal<Chart[]>([]);

  ngAfterViewInit(): void {
    this.createCloneByLang();
  }

  /**
   * Creates a bar chart where the average
   * clone coverage is displayed by different
   * languages.
   * @private
   */
  private createCloneByLang(): void {
    const dataPoints = this.dataPoints();
    const business: Separation[] = [];
    const research: Separation[] = [];


    Object.values(dataPoints).forEach(({ field, method_length }) => {
      field === 'nonSci' ? business.push(method_length) : research.push(method_length);
    });

    const getAverage = (arr: number[]) => arr.reduce((a, b) => a + b, 0) / arr.length;

    const sciAverageRed: number[] = business.map(s => s.red);
    const sciAverageYellow: number[] = business.map(s => s.yellow);
    const sciAverageGreen: number[] = business.map(s => s.green);

    const nonSciAverageRed: number[] = research.map(s => s.red);
    const nonSciAverageYellow: number[] = research.map(s => s.yellow);
    const nonSciAverageGreen: number[] = research.map(s => s.green);

    const config: ChartConfiguration = {
      type: 'bar' as ChartType,
      data: {
        labels: ['Business', 'Research'],
        datasets: [
          {
            label: 'Green',
            data: [getAverage(sciAverageGreen), getAverage(nonSciAverageGreen)],
            backgroundColor: 'rgba(75, 192, 75, 0.4)',
            borderColor: 'rgba(75, 192, 75, 0.9)',
            borderWidth: 1
          },
          {
            label: 'Yellow',
            data: [getAverage(sciAverageYellow), getAverage(nonSciAverageYellow)],
            backgroundColor: 'rgba(255, 205, 86, 0.6)',
            borderColor: 'rgba(255, 205, 86, 1)',
            borderWidth: 1
          },
          {
            label: 'Red',
            data: [getAverage(sciAverageRed), getAverage(nonSciAverageRed)],
            backgroundColor: 'rgba(255, 99, 132, 0.4)',
            borderColor: 'rgba(255, 99, 132, 0.8)',
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
            text: 'Business vs Research in Method Length'
          }
        }
      }
    };

    const canvas = document.getElementById('BusinessVsResearchInMethodLength') as HTMLCanvasElement;
    if (canvas) {
      this.allNonReactivePlots.update(value => [...value, new Chart(canvas, config)]);
    }
  }

  ngOnDestroy(): void {
    const nonReactivCharts = this.allNonReactivePlots();
    nonReactivCharts.forEach(chart => chart.destroy());
  }
}
