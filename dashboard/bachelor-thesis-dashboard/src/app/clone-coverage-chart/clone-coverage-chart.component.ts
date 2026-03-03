import {Component, AfterViewInit, OnDestroy, signal } from '@angular/core';
import { Chart, ChartConfiguration, ChartType, registerables } from 'chart.js';
import {BoxPlotController, BoxAndWiskers} from '@sgratzl/chartjs-chart-boxplot';
import {AnalyzedData} from '../../../shared/interface/data-point';
import {DataHelper} from '../../../shared/data-helper';
import {ScatterPlot} from '../charts/scatter-plot/scatter-plot';

// Register Chart.js components globally
Chart.register(...registerables, BoxPlotController, BoxAndWiskers);


@Component({
  selector: 'app-clone-coverage-chart',
  templateUrl: './clone-coverage-chart.html',
  imports: [
    ScatterPlot
  ],
  styleUrls: ['./clone-coverage-chart.scss']
})
export class CloneCoverageChart implements AfterViewInit, OnDestroy {
  dataPoints = signal<Record<string, AnalyzedData>>(DataHelper.getData);

  allNonReactivePlots = signal<Chart[]>([]);

  ngAfterViewInit(): void {
    this.createCloneByLang();
    this.createCloneByField();
    this.createAverageClone();
    this.createCloneBoxplot();
  }

  /**
   * Creates a bar chart where the average
   * clone coverage is displayed by different
   * languages.
   * @private
   */
  private createCloneByLang(): void {
    const dataPoints = this.dataPoints();
    const cloneCoverages: Record<string, SciFields<number>> = {};

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

      labels.push(
        `${lang} (isSci: ${entry.isSci?.count ?? 0}, nonSci: ${entry.nonSci?.count ?? 0})`
      );

      isSciData.push(isSciAvg);
      nonSciData.push(nonSciAvg);
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

    const canvas = document.getElementById('BusinessVsResearchByLang') as HTMLCanvasElement;
    if (canvas) {
      this.allNonReactivePlots.update(value => [...value, new Chart(canvas, config)]);
    }
  }

  /**
   * Creates a bar chart where the average
   * clone coverage is displayed by different
   * fields.
   * @private
   */
  private createCloneByField(): void {
    const dataPoints = this.dataPoints();
    const cloneCoverages: Record<string, ValueMap<number>> = {};

    Object.values(dataPoints).forEach(({field, clone_coverage }) => {
      cloneCoverages[field] ??= {count: 0, value: 0};

      const current = cloneCoverages[field];

      cloneCoverages[field] = {
        value: (current?.value ?? 0) + clone_coverage,
        count: (current?.count ?? 0) + 1
      };
    });

    const labels: string[] = [];
    const data: number[] = [];

    Object.entries(cloneCoverages).forEach(([field, entry]) => {
      const avg = entry ? entry.value / entry.count : 0;

      labels.push(`${field} (count: ${entry?.count ?? 0})`);
      data.push(avg);
    });

    const config: ChartConfiguration = {
      type: 'bar' as ChartType,
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Field Average',
            data: data,
            backgroundColor: 'rgba(54, 162, 235, 0.6)',
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
            text: 'Different Fields in Clone Coverage'
          }
        }
      }
    };

    const canvas = document.getElementById('BusinessVsResearchByField') as HTMLCanvasElement;
    if (canvas) {
      this.allNonReactivePlots.update(value => [...value, new Chart(canvas, config)]);
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
      if(entry.field === "nonSci"){
        averageNonSci.push(entry.clone_coverage);
      } else {
        averageSci.push(entry.clone_coverage);
      }
    });

    const computedSciAverage = averageSci.length === 0 ? 0 : averageSci.reduce((acc, n) => acc + n, 0) /averageSci.length;
    const computedNonSciAverage = averageNonSci.length === 0 ? 0 : averageNonSci.reduce((acc, n) => acc + n, 0) / averageNonSci.length;


    const config = (isSci: boolean) => {
      const t: ChartConfiguration = {
        type: 'pie' as ChartType,
        data: {
          labels: [isSci ? 'Research Software (count: ' + averageSci.length + ')' : 'Business Software (count: ' + averageNonSci.length + ')'],
          datasets: [
            {
              label: '',
              data: [isSci ? computedSciAverage : computedNonSciAverage, isSci ? 1 - computedSciAverage : 1 - computedNonSciAverage],
              backgroundColor: ['rgba(255, 99, 132, 0.4)', 'rgba(54, 162, 235, 0.6)'],
              borderColor: ['rgba(255, 99, 132, 0.8)', 'rgba(54, 162, 235, 1)'],
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
              text: isSci ? 'Research in Clone Coverage' : 'Business in Clone Coverage'
            }
          }
        }
      };
      return t;
    };


    const canvas1 = document.getElementById('AverageCloneCoverageSci') as HTMLCanvasElement;
    const canvas2 = document.getElementById('AverageCloneCoverageNonSci') as HTMLCanvasElement;
    this.allNonReactivePlots.update(value => [...value, new Chart(canvas1, config(true))]);
    this.allNonReactivePlots.update(value => [...value, new Chart(canvas2, config(false))]);
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
            backgroundColor: ['rgba(255, 99, 132, 0.4)','rgba(255, 99, 132, 0.4)', 'rgba(54, 162, 235, 0.8)'],
          }
        ]
      }
    };


    const canvas = document.getElementById('CloneCoverageBoxPlot') as HTMLCanvasElement;
    if (canvas) {
      this.allNonReactivePlots.update(value => [...value, new Chart(canvas, config)]);
    }
  }

  ngOnDestroy(): void {
    const nonReactivCharts = this.allNonReactivePlots();
    nonReactivCharts.forEach(chart => chart.destroy());
  }
}
