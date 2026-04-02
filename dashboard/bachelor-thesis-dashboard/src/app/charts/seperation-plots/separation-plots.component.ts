import {AfterViewInit, Component, computed, effect, input, OnDestroy, signal} from '@angular/core';
import {AnalyzedData, ScoredData, Separation} from '../../../../shared/interface/data-point';
import {combineSeparations, DataHelper, getAverage} from '../../../../shared/data-helper';
import {Chart, ChartConfiguration, ChartType} from 'chart.js';
import {generateBucketLineConfig, updateChart} from '../../../utilities/utility';
import {FieldBarPlot} from '../field-bar-plot/field-bar-plot';
import {FormsModule} from '@angular/forms';
import {ScatterPlot} from '../scatter-plot/scatter-plot';

@Component({
  selector: 'app-separation-plots',
  imports: [
    FieldBarPlot,
    FormsModule,
    ScatterPlot
  ],
  templateUrl: './separation-plots.component.html',
  styleUrl: './separation-plots.component.scss',
})
export class SeparationPlots implements OnDestroy, AfterViewInit{
  scope = input<keyof AnalyzedData>('method_length');

  dataPoints = signal<Record<string, AnalyzedData>>(DataHelper.getData);

  allNonReactivePlots = signal<Chart[]>([]);

  MethodByLangMin = signal<number>(10);
  MethodByLangChart = signal<Chart | null>(null);
  MethodByLangConfig = computed(()=> {
    const dataPoints = this.dataPoints();
    const min = this.MethodByLangMin();
    const methodLength: Record<string, SciFields<ValueMap<Separation>>> = {};

    Object.values(dataPoints).forEach(entry => {
      methodLength[entry.lang] ??= {};

      const bucket = entry.field === 'nonSci' ? 'nonSci' : 'isSci';

      const current = methodLength[entry.lang][bucket];

      methodLength[entry.lang][bucket] = {
        value: current?.value ? combineSeparations(current.value, entry[this.scope()] as Separation)  : entry[this.scope()] as Separation,
        count: (current?.count ?? 0) + 1
      };
    });

    const labels: string[] = [];
    const isSciDataAverage: Separation[] = [];
    const nonSciDataAverage: Separation[] = [];

    Object.entries(methodLength).forEach(([lang, entry]) => {
      const total = (entry.isSci?.count ?? 0) + (entry.nonSci?.count ?? 0);
      if(total < min) return;

      const isSciAvgRed = entry.isSci
        ? entry.isSci.value.red / entry.isSci.count
        : 0;

      const nonSciAvgRed = entry.nonSci
        ? entry.nonSci.value.red / entry.nonSci.count
        : 0;

      const isSciAvgYellow = entry.isSci
        ? entry.isSci.value.yellow / entry.isSci.count
        : 0;

      const nonSciAvgYellow = entry.nonSci
        ? entry.nonSci.value.yellow / entry.nonSci.count
        : 0;

      const isSciAvgGreen = entry.isSci
        ? entry.isSci.value.green / entry.isSci.count
        : 0;

      const nonSciAvgGreen = entry.nonSci
        ? entry.nonSci.value.green / entry.nonSci.count
        : 0;

      labels.push(
        `${lang} (isSci: ${entry.isSci?.count ?? 0}, nonSci: ${entry.nonSci?.count ?? 0})`
      );

      isSciDataAverage.push({red: isSciAvgRed, yellow: isSciAvgYellow, green: isSciAvgGreen });
      nonSciDataAverage.push({red: nonSciAvgRed, yellow: nonSciAvgYellow, green: nonSciAvgGreen });
    });

    const config : ChartConfiguration = {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Business - Green',
            data: nonSciDataAverage.map(s => s.green),
            backgroundColor: 'rgba(75, 192, 75, 0.2)',
            borderColor: 'rgba(255, 99, 132, 0.8)',
            borderWidth: 1
          },
          {
            label: 'Business - Yellow',
            data: nonSciDataAverage.map(s => s.yellow),
            backgroundColor: 'rgba(255, 205, 86, 0.3)',
            borderColor: 'rgba(255, 99, 132, 0.8)',
            borderWidth: 1
          },
          {
            label: 'Business - Red',
            data: nonSciDataAverage.map(s => s.red),
            backgroundColor: 'rgba(255, 99, 132, 0.2)',
            borderColor: 'rgba(255, 99, 132, 0.8)',
            borderWidth: 1
          },

          {
            label: 'Research - Green',
            data: isSciDataAverage.map(s => s.green),
            backgroundColor: 'rgba(75, 192, 75, 0.4)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 1
          },
          {
            label: 'Research - Yellow',
            data: isSciDataAverage.map(s => s.yellow),
            backgroundColor: 'rgba(255, 205, 86, 0.6)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 1
          },
          {
            label: 'Research - Red',
            data: isSciDataAverage.map(s => s.red),
            backgroundColor: 'rgba(255, 99, 132, 0.4)',
            borderColor: 'rgba(54, 162, 235, 1)',
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
            text: `${this.scope()} by Language (Business vs Research)`
          }
        }
      }
    };
    return config;
  });

  MethodByFieldOptions = signal<(keyof Separation)[]>(['red', 'yellow', 'green']);
  MethodByFieldValue = signal<keyof Separation>('red');


  constructor() {
    effect(() => {
      const chart = this.MethodByLangChart();
      const config = this.MethodByLangConfig();

      updateChart(chart, config);
    });
  }


  ngAfterViewInit(): void {
    this.createMethodLengthSciNonSci();
    this.createMethodByLang();
    this.createMethodLengthValue(true);
    this.createMethodLengthValue(false);

    this.MethodByFieldOptions().forEach(option => {
      this.createMethodBucket('LOC', option, {max: 99999, size: 5000});
      this.createMethodBucket('authors', option,  {max:31, size: 2});
      this.createMethodBucket('files', option, {max:1499, size: 100});
    });

  }

  /**
   * Creates a bar chart where the average
   * method length is displayed by business and scientific.
   * @private
   */
  private createMethodLengthSciNonSci(): void {
    const dataPoints = this.dataPoints();
    const business: Separation[] = [];
    const research: Separation[] = [];


    Object.values(dataPoints).forEach((entry) => {
      entry.field === 'nonSci' ? business.push(entry[this.scope()] as Separation) : research.push(entry[this.scope()] as Separation);
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
            text: `Business vs Research in ${this.scope()} Average`
          }
        }
      }
    };

    const canvas = document.getElementById('BusinessVsResearchInMethodLength') as HTMLCanvasElement;
    if (canvas) {
      this.allNonReactivePlots.update(value => [...value, new Chart(canvas, config)]);
    }
  }

  /**
   * Creates a bar chart where the average
   * method length is displayed by business and scientific.
   * @private
   */
  private createMethodByLang(): void {
    const canvas = document.getElementById('MethodLengthByLang') as HTMLCanvasElement;
    if (canvas) {
      this.MethodByLangChart.set(new Chart(canvas, this.MethodByLangConfig()));
    }
  }

  /**
   * Creates a bar chart where the average
   * method length is displayed by business and scientific.
   * @private
   */
  private createMethodLengthValue(sci: boolean): void {
    const dataPoints = this.dataPoints();
    const values0_999: Separation = {red: 0, yellow: 0, green: 0};
    const values1000_2999: Separation = {red: 0, yellow: 0, green: 0};
    const values3000_5999: Separation = {red: 0, yellow: 0, green: 0};
    const values6000_8999: Separation = {red: 0, yellow: 0, green: 0};
    const values9000plus: Separation = {red: 0, yellow: 0, green: 0};

    Object.values(dataPoints).forEach(entry => {
      const validateField = sci ? entry.field !== 'nonSci' : entry.field === 'nonSci';

      if(validateField){
        const keysToCheck: (keyof Separation)[] = ['red', 'yellow', 'green'];

        keysToCheck.forEach((key) => {
          const innerScope = (entry[this.scope()] as Separation);
          switch(innerScope[key] >= 0){
            case innerScope[key] < 1000: values0_999[key]++; break;
            case innerScope[key] < 3000: values1000_2999[key]++; break;
            case innerScope[key] < 6000: values3000_5999[key]++; break;
            case innerScope[key] < 9000: values6000_8999[key]++; break;
            case innerScope[key] >= 9000: values9000plus[key]++; break;
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
            text: `${this.scope()} Findings in ${sci ? 'Scientific' : ' Business'}`
          }
        }
      }
    };

    const canvas = document.getElementById(`MethodLengthByValue${sci ? 'Sci' : 'NonSci'}`) as HTMLCanvasElement;
    if (canvas) {
      this.allNonReactivePlots.update(value => [...value, new Chart(canvas, config)]);
    }
  }

  private createMethodBucket(
    key: keyof ScoredData,
    scope: keyof Separation,
    options: {max: number, size: number}
  ){
    const config = generateBucketLineConfig(
      this.scope(),
      key,
      options,
      scope
    );
    const canvas = document.getElementById('Method' + key + scope) as HTMLCanvasElement;
    if (canvas) {
      this.allNonReactivePlots.update(value => [...value, new Chart(canvas, config)]);
    }
  }
  ngOnDestroy(): void {
    const nonReactivCharts = this.allNonReactivePlots();
    nonReactivCharts.forEach(chart => chart.destroy());

    const LangChart = this.MethodByLangChart()
    if(LangChart) LangChart.destroy();
  }
}
