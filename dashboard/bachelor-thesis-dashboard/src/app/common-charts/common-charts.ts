import {AfterViewInit, Component, OnDestroy, signal} from '@angular/core';
import { ScoredData, Separation} from '../../../shared/interface/data-point';
import {DataHelper} from '../../../shared/data-helper';
import {Chart, ChartConfiguration, ChartType} from 'chart.js';
import {ScatterPlot} from '../charts/scatter-plot/scatter-plot';

@Component({
  selector: 'app-common-charts',
  imports: [
    ScatterPlot
  ],
  templateUrl: './common-charts.html',
  styleUrl: './common-charts.scss',
})
export class CommonCharts implements AfterViewInit, OnDestroy{
  dataPoints = signal<Record<string, ScoredData>>(DataHelper.getScoredData());

  allNonReactivePlots = signal<Chart[]>([]);

  ngAfterViewInit(): void {
    this.createMethodLengthSciNonSci();
    this.createMethodByLang();
    this.createScoringLine();
    this.createAverageScoring();
    this.createScoringBoxplot();
  }

  private getAverage = (arr: number[]) => arr.reduce((a, b) => a + b, 0) / arr.length;
  private combineSeparations = (a: Separation, b: Separation)=> {return{red: a.red + b.red, yellow: a.yellow + b.yellow, green: a.green + b.green}}

  /**
   * Creates a bar chart where the average
   * method length is displayed by business and scientific.
   * @private
   */
  private createMethodLengthSciNonSci(): void {
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
            data: [this.getAverage(sciAverageGreen), this.getAverage(nonSciAverageGreen)],
            backgroundColor: 'rgba(75, 192, 75, 0.4)',
            borderColor: 'rgba(75, 192, 75, 0.9)',
            borderWidth: 1
          },
          {
            label: 'Yellow',
            data: [this.getAverage(sciAverageYellow), this.getAverage(nonSciAverageYellow)],
            backgroundColor: 'rgba(255, 205, 86, 0.6)',
            borderColor: 'rgba(255, 205, 86, 1)',
            borderWidth: 1
          },
          {
            label: 'Red',
            data: [this.getAverage(sciAverageRed), this.getAverage(nonSciAverageRed)],
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
            text: 'Business vs Research in Method Length Average'
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
    const dataPoints = this.dataPoints();
    const methodLength: Record<string, SciFields<Separation>> = {};


    Object.values(dataPoints).forEach(({ lang ,field, method_length }) => {
      methodLength[lang] ??= {};

      const bucket = field === 'nonSci' ? 'nonSci' : 'isSci';

      const current = methodLength[lang][bucket];

      methodLength[lang][bucket] = {
        value: current?.value ? this.combineSeparations(current.value, method_length)  : method_length,
        count: (current?.count ?? 0) + 1
      };
    });

    const labels: string[] = [];
    const isSciDataAverage: Separation[] = [];
    const nonSciDataAverage: Separation[] = [];

    Object.entries(methodLength).forEach(([lang, entry]) => {
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
            text: 'Method Length by Language (Business vs Research)'
          }
        }
      }
    };

    const canvas = document.getElementById('MethodLengthByLang') as HTMLCanvasElement;
    if (canvas) {
      this.allNonReactivePlots.update(value => [...value, new Chart(canvas, config)]);
    }
  }


  /**
   * Creates two pie charts where average clone coverage is
   * displayed by Sci and NonSci.
   * @private
   */
  private createScoringLine(): void {
    const dataPoints = this.dataPoints();
    const sciData: ValueMap<number>[] = [];
    const nonSciData: ValueMap<number>[] = [];

    Object.values(dataPoints).forEach(entry => {
      const data = entry.field === "nonSci" ? nonSciData : sciData;
      data.push({value: entry.scoring, count: entry.LOC});
    });

    const bucketSize = 5000;
    const buckets: Record<number, SciFields<number>> = {};

    const bucketMapper = (entry: ValueMap<number>, sci: boolean) => {
      const bucket = Math.floor(entry.count / bucketSize) * bucketSize;
      if(bucket > 99999) return;

      if (!buckets[bucket]) buckets[bucket] = { isSci: {value: 0, count: 0}, nonSci: {value: 0, count: 0}};

      const bucketMap =  buckets[bucket][sci ? "isSci" : "nonSci"];
      if(bucketMap){
        bucketMap.value += entry.value;
        bucketMap.count += 1;
      }
    }

    sciData.forEach(entry => bucketMapper(entry, true));

    nonSciData.forEach(entry => bucketMapper(entry, false));

    const labels: Set<string> = new Set<string>();
    const sciAverages: number[] = [];
    const nonSciAverages: number[] = [];


    Object.entries(buckets)
      .sort((a, b) => Number(a[0]) - Number(b[0]))
      .forEach(([bucketStart, entry]) => {
        const sciAvg = entry.isSci ? entry.isSci.value / entry.isSci.count : 0;
        const nonSciAvg = entry.nonSci ? entry.nonSci.value / entry.nonSci.count : 0;


        labels.add(`${bucketStart}-${Number(bucketStart) + bucketSize} Sci:${(entry.isSci?.count ?? 0)}, nonSci:${(entry.nonSci?.count ?? 0)}`);
        sciAverages.push(sciAvg);
        nonSciAverages.push(nonSciAvg);
      });

    const labelsAsArray = Array.from(labels);

    const config: ChartConfiguration<'line'> = {
      type: 'line',
      data: {
        labels: labelsAsArray,
        datasets: [
          {
            label: 'Research Scoring',
            data: sciAverages,
            borderColor: 'rgba(54, 162, 235, 0.8)',
            tension: 0.3
          },
          {
            label: 'Business Scoring',
            data: nonSciAverages,
            borderColor: 'rgba(255, 99, 132, 0.8)',
            tension: 0.3
          }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {position: 'top'},
          title: {
            display: true,
            text: 'Research and Business in Scoring'
          }
        },
        scales: {
          x: {
            beginAtZero: true,
            // max: 100000
          }
        }
      }
    };

    const canvas = document.getElementById('ScoringLine') as HTMLCanvasElement;
    this.allNonReactivePlots.update(value => [...value, new Chart(canvas, config)]);
  }

  /**
   * Creates two pie charts where average clone coverage is
   * displayed by Sci and NonSci.
   * @private
   */
  private createAverageScoring(): void {
    const dataPoints = this.dataPoints();
    const averageSci: number[] = [];
    const averageNonSci: number[] = [];

    Object.values(dataPoints).forEach(entry => {
      if(entry.field === "nonSci"){
        averageNonSci.push(entry.scoring);
      } else {
        averageSci.push(entry.scoring);
      }
    });

    const computedSciAverage = averageSci.length === 0 ? 0 : averageSci.reduce((acc, n) => acc + n, 0) /averageSci.length;
    const computedNonSciAverage = averageNonSci.length === 0 ? 0 : averageNonSci.reduce((acc, n) => acc + n, 0) / averageNonSci.length;

    const barConfig: ChartConfiguration = {
      type: 'bar' as ChartType,
      data: {
        labels: ['Average Scoring in Business and Research'],
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
            text: 'Research and Business in Scoring'
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            max: 100
          }
        }
      }
    };

    const canvas = document.getElementById('AverageScoring') as HTMLCanvasElement;
    this.allNonReactivePlots.update(value => [...value, new Chart(canvas, barConfig)]);
  }

  /**
   * Creates a boxplot where the dots are sorted by Author and Clone Coverage!
   * @private
   */
  private createScoringBoxplot(): void {
    const dataPoints = this.dataPoints();

    const sciCloneCoverage: number[] = [];
    const nonSciCloneCoverage: number[] = [];

    Object.values(dataPoints).forEach(entry => {
      entry.field === "nonSci" ?
        nonSciCloneCoverage.push(entry.scoring) :
        sciCloneCoverage.push(entry.scoring);
    });

    sciCloneCoverage.sort((a, b) => a < b ? a : b);
    nonSciCloneCoverage.sort((a, b) => a < b ? a : b);

    const config: ChartConfiguration<'boxplot'> = {
      type: 'boxplot',
      data: {
        labels: ['Research', 'Business', 'Average'],
        datasets: [
          {
            label: 'Scoring',
            data: [
              sciCloneCoverage,     // Boxplot 1
              nonSciCloneCoverage,   // Boxplot 2
              [...sciCloneCoverage, ...nonSciCloneCoverage] //Boxplot 3
            ],
            backgroundColor: ['rgba(255, 99, 132, 0.4)', 'rgba(54, 162, 235, 0.6)', 'rgba(75, 192, 75, 0.4)'],
          }
        ]
      }
    };


    const canvas = document.getElementById('ScoringBoxplot') as HTMLCanvasElement;
    if (canvas) {
      this.allNonReactivePlots.update(value => [...value, new Chart(canvas, config)]);
    }
  }

  ngOnDestroy(): void {
    const nonReactivCharts = this.allNonReactivePlots();
    nonReactivCharts.forEach(chart => chart.destroy());
  }
}
