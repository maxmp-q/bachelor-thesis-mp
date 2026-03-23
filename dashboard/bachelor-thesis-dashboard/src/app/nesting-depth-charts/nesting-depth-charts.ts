import {AfterViewInit, Component, OnDestroy, signal} from '@angular/core';
import {FieldBarPlot} from '../charts/field-bar-plot/field-bar-plot';
import {ScatterPlot} from '../charts/scatter-plot/scatter-plot';
import {Separation, ScoredData} from '../../../shared/interface/data-point';
import {DataHelper, getAverage} from '../../../shared/data-helper';
import {Chart, ChartConfiguration, ChartType} from 'chart.js';

@Component({
  selector: 'app-nesting-depth-charts',
  imports: [
    FieldBarPlot,
    ScatterPlot
  ],
  templateUrl: './nesting-depth-charts.html',
  styleUrl: './nesting-depth-charts.scss',
})
export class NestingDepthCharts implements AfterViewInit, OnDestroy {
  dataPoints = signal<Record<string, ScoredData>>(DataHelper.getScoredData());

  allNonReactivePlots = signal<Chart[]>([]);

  ngAfterViewInit() {
    this.createNestingDepthSciNonSci();
    this.createNestingDepthValue(true);
    this.createNestingDepthValue(false);
  }

  /**
   * Creates a bar chart where the average
   * method length is displayed by business and scientific.
   * @private
   */
  private createNestingDepthSciNonSci(): void {
    const dataPoints = this.dataPoints();
    const business: Separation[] = [];
    const research: Separation[] = [];


    Object.values(dataPoints).forEach(({ field, method_length }) => {
      field === 'nonSci' ? business.push(method_length) : research.push(method_length);
    });

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
            text: 'Business vs Research in Nesting Depth Average'
          }
        }
      }
    };

    const canvas = document.getElementById('BusinessVsResearchInNestingDepth') as HTMLCanvasElement;
    if (canvas) {
      this.allNonReactivePlots.update(value => [...value, new Chart(canvas, config)]);
    }
  }

  /**
   * Creates a bar chart where the average
   * method length is displayed by business and scientific.
   * @private
   */
  private createNestingDepthValue(sci: boolean): void {
    const dataPoints = this.dataPoints();
    const values0_999: Separation = {red: 0, yellow: 0, green: 0};
    const values1000_2999: Separation = {red: 0, yellow: 0, green: 0};
    const values3000_5999: Separation = {red: 0, yellow: 0, green: 0};
    const values6000_8999: Separation = {red: 0, yellow: 0, green: 0};
    const values9000plus: Separation = {red: 0, yellow: 0, green: 0};

    Object.values(dataPoints).forEach(({ field, nesting_depth }) => {
      const validateField = sci ? field !== 'nonSci' : field === 'nonSci';

      if(validateField){
        const keysToCheck: (keyof Separation)[] = ['red', 'yellow', 'green'];

        keysToCheck.forEach((key) => {
          switch(nesting_depth[key] >= 0){
            case nesting_depth[key] < 1000: values0_999[key]++; break;
            case nesting_depth[key] < 3000: values1000_2999[key]++; break;
            case nesting_depth[key] < 6000: values3000_5999[key]++; break;
            case nesting_depth[key] < 9000: values6000_8999[key]++; break;
            case nesting_depth[key] >= 9000: values9000plus[key]++; break;
          }
        })
      }
    });

    const config: ChartConfiguration = {
      type: 'bar' as ChartType,
      data: {
        labels: ['0-999', '1000-2999', '3000-5999', '6000-8999','9000+'],
        datasets: [
          {
            label: 'Green',
            data: [values0_999.green, values1000_2999.green, values3000_5999.green, values6000_8999.green, values9000plus.green],
            backgroundColor: 'rgba(75, 192, 75, 0.4)',
            borderColor: 'rgba(75, 192, 75, 0.9)',
            borderWidth: 1
          },
          {
            label: 'Yellow',
            data: [values0_999.yellow, values1000_2999.yellow, values3000_5999.yellow, values6000_8999.yellow, values9000plus.yellow],
            backgroundColor: 'rgba(255, 205, 86, 0.6)',
            borderColor: 'rgba(255, 205, 86, 1)',
            borderWidth: 1
          },
          {
            label: 'Red',
            data: [values0_999.red, values1000_2999.red, values3000_5999.red, values6000_8999.red, values9000plus.red],
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
            text: `Nesting Depth Findings in ${sci ? 'Scientific' : ' Business'}`
          }
        }
      }
    };

    const canvas = document.getElementById(`NestingDepthByValue${sci ? 'Sci' : 'NonSci'}`) as HTMLCanvasElement;
    if (canvas) {
      this.allNonReactivePlots.update(value => [...value, new Chart(canvas, config)]);
    }
  }


  ngOnDestroy(): void {
    const nonReactivCharts = this.allNonReactivePlots();
    nonReactivCharts.forEach(chart => chart.destroy());
  }
}
