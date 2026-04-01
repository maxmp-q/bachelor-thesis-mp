import {Component, AfterViewInit, OnDestroy, signal, computed, effect} from '@angular/core';
import { Chart, ChartConfiguration, ChartType } from 'chart.js';
import { ScoredData} from '../../../shared/interface/data-point';
import {DataHelper, getAverage} from '../../../shared/data-helper';
import {ScatterPlot} from '../charts/scatter-plot/scatter-plot';
import {FieldBarPlot} from '../charts/field-bar-plot/field-bar-plot';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {generateBucketLineConfig, updateChart} from '../../utilities/utility';

@Component({
  selector: 'app-clone-coverage-chart',
  templateUrl: './clone-coverage-chart.html',
  imports: [
    ScatterPlot,
    FieldBarPlot,
    ReactiveFormsModule,
    FormsModule
  ],
  styleUrls: ['./clone-coverage-chart.scss']
})
export class CloneCoverageChart implements AfterViewInit, OnDestroy {
  dataPoints = signal<Record<string, ScoredData>>(DataHelper.getScoredData());

  allNonReactivePlots = signal<Chart[]>([]);

  CloneByLangMin = signal<number>(0);
  CloneByLangChart = signal<Chart | null>(null);
  CloneByLangConfig = computed(()=> {
    const dataPoints = this.dataPoints();
    const CloneByLangMin = this.CloneByLangMin();

    const cloneCoverages: Record<string, SciFields<ValueMap<number>>> = {};

    Object.values(dataPoints).forEach(({ lang, field, clone_coverage }) => {
      cloneCoverages[lang] ??= {};

      const bucket = field === 'nonSci' ? 'nonSci' : 'isSci';

      const current = cloneCoverages[lang][bucket];

      cloneCoverages[lang][bucket] = {
        value: (current?.value ?? 0) + clone_coverage,
        count: (current?.count ?? 0) + 1
      };
    });

    const labels: string[] = [];
    const isSciData: number[] = [];
    const nonSciData: number[] = [];

    Object.entries(cloneCoverages).forEach(([lang, entry]) => {
      const isSciAvg = entry.isSci
        ? entry.isSci.value / entry.isSci.count
        : 0;

      const nonSciAvg = entry.nonSci
        ? entry.nonSci.value / entry.nonSci.count
        : 0;

      const totalCount = (entry.isSci?.count ?? 0) + (entry.nonSci?.count ?? 0);
      if(totalCount >= CloneByLangMin){
        labels.push(
          `${lang} (isSci: ${entry.isSci?.count ?? 0}, nonSci: ${entry.nonSci?.count ?? 0})`
        );

        isSciData.push(isSciAvg);
        nonSciData.push(nonSciAvg);
      }
    });

    const config: ChartConfiguration = {
      type: 'bar' as ChartType,
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Research Average',
            data: isSciData,
            backgroundColor: 'rgba(54, 162, 235, 0.6)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 1
          },
          {
            label: 'Business Average',
            data: nonSciData,
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
            text: 'Business vs Research in Clone Coverage'
          }
        }
      }
    };
    return config;
  })


  constructor() {
    effect(() => {
      const config = this.CloneByLangConfig();
      const chart = this.CloneByLangChart();

      updateChart(chart, config);
    });
  }

  ngAfterViewInit(): void {
    this.createCloneByLang();
    this.createAverageClone();
    this.createCloneLine();
    this.createCloneBoxplot();
    this.createCloneFileLine();
    this.createCloneAuthorLine();
  }

  /**
   * Creates a bar chart where the average
   * clone coverage is displayed by different
   * languages.
   * @private
   */
  private createCloneByLang(): void {
    const canvas = document.getElementById('BusinessVsResearchByLang') as HTMLCanvasElement;
    if (canvas) {
      this.CloneByLangChart.set(new Chart(canvas, this.CloneByLangConfig()));
    }
  }

  /**
   * Creates two pie charts where average clone coverage is
   * displayed by Sci and NonSci.
   * @private
   */
  private createAverageClone(): void {
    const dataPoints = this.dataPoints();
    const averageSci: number[] = [];
    const averageNonSci: number[] = [];

    Object.values(dataPoints).forEach(entry => {
      const scope = entry.field === "nonSci" ? averageNonSci : averageSci;
      scope.push(entry.clone_coverage);
    });

    const computedSciAverage = getAverage(averageSci);
    const computedNonSciAverage = getAverage(averageNonSci);

    const barConfig: ChartConfiguration = {
        type: 'bar' as ChartType,
        data: {
          labels: ['Average Clone Coverage in Business and Research'],
          datasets: [
            {
              label: 'Research Software (count: ' + averageSci.length + ')',
              data: [computedSciAverage],
              backgroundColor: 'rgba(54, 162, 235, 0.6)',
              borderColor: 'rgba(54, 162, 235, 1)',
              borderWidth: 1
            },
            {
              label: 'Business Software (count: ' + averageNonSci.length + ')',
              data: [computedNonSciAverage],
              backgroundColor: 'rgba(255, 99, 132, 0.4)',
              borderColor: 'rgba(255, 99, 132, 0.8)',
              borderWidth: 1
            }
          ]
        },
        options: {
          responsive: true,
          plugins: {
            legend: {position: 'top'},
            title: {
              display: true,
              text: 'Research and Business in Clone Coverage'
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: "Clone Coverage"
              },
              max: 1
            }
          }
        }
    };


    const canvas = document.getElementById('AverageCloneCoverage') as HTMLCanvasElement;
    this.allNonReactivePlots.update(value => [...value, new Chart(canvas, barConfig)]);
  }


  /**
   * Creates two pie charts where average clone coverage is
   * displayed by Sci and NonSci.
   * @private
   */
  private createCloneLine(): void {
    const config = generateBucketLineConfig('clone_coverage', 'LOC', {max:99999, size:5000});
    const canvas = document.getElementById('CloneCoverageLine') as HTMLCanvasElement;
    this.allNonReactivePlots.update(value => [...value, new Chart(canvas, config)]);
  }

  /**
   * Creates two pie charts where average clone coverage is
   * displayed by Sci and NonSci.
   * @private
   */
  private createCloneFileLine(): void {
    const config = generateBucketLineConfig('clone_coverage', 'files', {max:1499, size: 100});
    const canvas = document.getElementById('CloneCoverageLOCLine') as HTMLCanvasElement;
    this.allNonReactivePlots.update(value => [...value, new Chart(canvas, config)]);
  }

  /**
   * Creates two pie charts where average clone coverage is
   * displayed by Sci and NonSci.
   * @private
   */
  private createCloneAuthorLine(): void {
    const config = generateBucketLineConfig('clone_coverage', 'authors', {max:31, size: 2});
    const canvas = document.getElementById('CloneCoverageAuthorLine') as HTMLCanvasElement;
    this.allNonReactivePlots.update(value => [...value, new Chart(canvas, config)]);
  }

  /**
   * Creates a boxplot where the dots are sorted by Author and Clone Coverage!
   * @private
   */
  private createCloneBoxplot(): void {
    const dataPoints = this.dataPoints();

    const sciCloneCoverage: number[] = [];
    const nonSciCloneCoverage: number[] = [];

    Object.values(dataPoints).forEach(entry => {
      entry.field === "nonSci" ?
          nonSciCloneCoverage.push(entry.clone_coverage) :
          sciCloneCoverage.push(entry.clone_coverage);
    });

    sciCloneCoverage.sort((a, b) => a < b ? a : b);
    nonSciCloneCoverage.sort((a, b) => a < b ? a : b);

    const config: ChartConfiguration<'boxplot'> = {
      type: 'boxplot',
      data: {
        labels: ['Research', 'Business', 'Average'],
        datasets: [
          {
            label: 'Clone Coverage',
            data: [
              sciCloneCoverage,     // Boxplot 1
              nonSciCloneCoverage,   // Boxplot 2
              [...sciCloneCoverage, ...nonSciCloneCoverage] //Boxplot 3
            ],
            backgroundColor: ['rgba(255, 99, 132, 0.4)', 'rgba(54, 162, 235, 0.6)', 'rgba(75, 192, 75, 0.4)'],
          }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {position: 'top'},
          title: {
            display: true,
            text: 'Research, Business and Average in Clone Coverage'
          }
        },
        scales: {
          y: {
            type: 'linear',
            title: {
              display: true,
              text: "Clone Coverage"
            }
          }
        }
      }
    };


    const canvas = document.getElementById('CloneCoverageBoxPlot') as HTMLCanvasElement;
    if (canvas) {
      this.allNonReactivePlots.update(value => [...value, new Chart(canvas, config)]);
    }
  }

  ngOnDestroy(): void {
    const nonReactivCharts = this.allNonReactivePlots();
    const CloneByLang = this.CloneByLangChart();

    if(CloneByLang) CloneByLang.destroy();
    nonReactivCharts.forEach(chart => chart.destroy());
  }
}
