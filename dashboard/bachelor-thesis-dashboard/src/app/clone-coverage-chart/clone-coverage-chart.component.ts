import {Component, AfterViewInit, OnDestroy, signal, computed, effect} from '@angular/core';
import { Chart, ChartConfiguration, ChartType, registerables } from 'chart.js';
import {AnalyzedData} from '../../../shared/interface/data-point';
import {DataHelper} from '../../../shared/data-helper';

// Register Chart.js components globally
Chart.register(...registerables);

interface ValueMap {
  value: number;
  count: number;
}

/** This interface contains the values of different languages. */
interface SciFields {
  isSci?: ValueMap;
  nonSci?: ValueMap;
}

@Component({
  selector: 'app-clone-coverage-chart',
  templateUrl: './clone-coverage-chart.html',
  styleUrls: ['./clone-coverage-chart.scss']
})
export class CloneCoverageChart implements AfterViewInit, OnDestroy {
  dataPoints = signal<Record<string, AnalyzedData>>(DataHelper.getData);

  maxLOC = signal<number>(100000);
  cloneScatterConfig = computed<ChartConfiguration<'scatter'>>(() => {
    const dataPoints = this.dataPoints();
    const maxLOC = this.maxLOC();

    const sciCloneCoverage: ValueMap[] = [];
    const nonSciCloneCoverage: ValueMap[] = [];

    Object.values(dataPoints).forEach(entry => {
      if(entry.field === "nonSci"){
        if(entry.LOC < maxLOC) nonSciCloneCoverage.push({count: entry.LOC, value: entry.clone_coverage});
      } else {
        if(entry.LOC < maxLOC) sciCloneCoverage.push({count: entry.LOC, value: entry.clone_coverage});
      }
    });

    const researchPoints = sciCloneCoverage.map((entry) => ({ x: entry.count, y: entry.value }));
    const businessPoints = nonSciCloneCoverage.map((entry) => ({ x: entry.count, y: entry.value }));


    const config: ChartConfiguration<'scatter'> = {
      type: 'scatter',
      data: {
        datasets: [
          {
            label: 'Research',
            data: researchPoints,
            backgroundColor: 'rgba(54, 162, 235, 0.8)',
            pointRadius: 5
          },
          {
            label: 'Business',
            data: businessPoints,
            backgroundColor: 'rgba(255, 99, 132, 0.8)',
            pointRadius: 5
          }
        ]
      },
      options: {
        responsive: true,
        scales: {
          x: {
            type: 'linear',
            title: {
              display: true,
              text: 'LOC'
            }
          },
          y: {
            title: {
              display: true,
              text: 'Clone Coverage'
            }
          }
        },
        plugins: {
          legend: {
            position: 'top'
          }
        }
      }
    };
    return config;
  });

  BusinessVsResearchByLang = signal<Chart | null>(null);
  AverageCloneCoverageSci = signal<Chart | null>(null);
  AverageCloneCoverageNonSci = signal<Chart | null>(null);
  CloneCoverageScatter= signal<Chart | null>(null);

  constructor() {
    effect(() => {
      const config = this.cloneScatterConfig();
      const chart = this.CloneCoverageScatter();

      if (!chart) return;
      if (config.options) chart.options = config.options;

      chart.data.datasets = config.data!.datasets!;

      chart.update();
    });
  }

  ngAfterViewInit(): void {
    this.createCloneByLang();
    this.createAverageClone();
    this.createCloneScatter();
  }

  /**
   * Creates a bar chart where the average
   * clone coverage is displayed by different
   * languages.
   * @private
   */
  private createCloneByLang(): void {
    const dataPoints = this.dataPoints();
    const cloneCoverages: Record<string, SciFields> = {};

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
      this.BusinessVsResearchByLang.set(new Chart(canvas, config));
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

    if (canvas1) this.AverageCloneCoverageSci.set(new Chart(canvas1, config(true)));
    if (canvas2) this.AverageCloneCoverageNonSci.set(new Chart(canvas2, config(false)));
  }

  /**
   * Creates a scatter plot where the dots are sorted by LOC and Clone Coverage!
   * @private
   */
  private createCloneScatter(): void {
    const canvas = document.getElementById('CloneCoverageScatter') as HTMLCanvasElement;
    if (canvas) {
      this.CloneCoverageScatter.set(new Chart(canvas, this.cloneScatterConfig()));
    }
  }

  ngOnDestroy(): void {
    const chart1 = this.BusinessVsResearchByLang();
    const chart2 = this.AverageCloneCoverageSci();
    const chart3 = this.AverageCloneCoverageNonSci();
    const chart4 = this.CloneCoverageScatter();
    if (chart1) chart1.destroy();
    if (chart2) chart2.destroy();
    if (chart3) chart3.destroy();
    if (chart4) chart4.destroy();
  }
}
