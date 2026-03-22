import {AfterViewInit, Component, computed, effect, OnDestroy, signal} from '@angular/core';
import {ScoredData} from '../../../shared/interface/data-point';
import {DataHelper, getAverage, getMedian} from '../../../shared/data-helper';
import {Chart, ChartConfiguration, ChartType} from 'chart.js';
import {FormsModule} from '@angular/forms';

@Component({
  selector: 'app-findings-charts',
  imports: [
    FormsModule
  ],
  templateUrl: './findings-charts.html',
  styleUrl: './findings-charts.scss',
})
export class FindingsCharts implements AfterViewInit, OnDestroy  {
  dataPoints = signal<Record<string, ScoredData>>(DataHelper.getScoredData());
  allNonReactivePlots = signal<Chart[]>([]);

  findingsAvg = computed(() => {
    const dataPoints = this.dataPoints();
    const findings: Record<string, ValueMap<number>> = {};

    Object.values(dataPoints).forEach(dataPoints => {
      dataPoints.findings_details.forEach(finding => {
        findings[finding.categoryName] ??= {value: 0, count: 0};

        const current = findings[finding.categoryName];

        current.count += finding.count;
        current.value += finding.countRed;
      });
    });
    return findings;
  });

  // All for Tag Cloud Chart
  wordCloudCount = signal<boolean>(true);
  TagCloudChart= signal<Chart | undefined>(undefined);
  TagCloudConfig = computed(() => {
    const findingsAvg = this.findingsAvg();
    const wordCloudCount = this.wordCloudCount();

    const data = (forPlot: boolean) => {
      if(forPlot) {
        return Object.values(findingsAvg).map(entry =>  {
          const entry_count = () => {
            const count = entry.count;

            if(count > 100000) return count;
            if(count < 50000 && count > 30000) return count / 2;
            return count / 10;
          };

          return wordCloudCount ? Math.log2(entry_count()) * 5 : Math.log2(entry.value) * 5
        });
      } else {
        return Object.values(findingsAvg).map(entry =>  wordCloudCount ? entry.count : entry.value)
      }
    }

    const config: ChartConfiguration<'wordCloud'> = {
      type: 'wordCloud',
      data: {
        labels: Object.keys(findingsAvg),
        datasets: [
          {
            label: 'Tag Cloud',
            data: data(true),
            originalValues: data(false),
            color: () => {
              // Random color for each word
              return  wordCloudCount ?`hsl(${Math.random() * 360}, 70%, 50%)` : 'rgba(255, 99, 132, 0.8)' ;
            }
          }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'top' },
          tooltip: {
            callbacks: {
              label: (context) => {
                const dataset: any = context.dataset;
                const value = dataset.originalValues[context.dataIndex];

                return `${context.label}: ${value.toLocaleString()}`;
              }
            }
          },
          title: {
            display: true,
            text: 'All Findings ' + (wordCloudCount ? 'count' : 'count-red')
          }
        },
        elements: {
          word: {
            minRotation: 0,
            maxRotation: 0,
            padding: 4
          }
        }
      }
    };
    return config;
  });

  // All for Tag Cloud Chart
  barCount = signal<boolean>(true);
  barMedian = signal<boolean>(false);
  BarChart= signal<Chart | undefined>(undefined);
  BarConfig = computed(() => {
    const dataPoints = this.dataPoints();
    const barCount = this.barCount();
    const barMedian = this.barMedian();

    const data: SciFields<Record<string, number[]>> = {
      isSci: {},
      nonSci: {}
    };

    Object.values(dataPoints).forEach(dataPoint => {
      const scope = dataPoint.field === "nonSci" ? 'nonSci' : 'isSci';

      dataPoint.findings_details.forEach(finding => {
        data[scope] ??= {};

        const record = data[scope];
        record[finding.categoryName] ??= [];
        record[finding.categoryName].push(barCount ? finding.count : finding.countRed);
      })
    });

    const labels = Object.keys(data.nonSci!).map(key => key);

    const isSciData = Object.values(data.isSci!)
      .map(arr =>
        barMedian ?
          Math.floor(getMedian(arr)) :
          Math.floor(getAverage(arr))
      );

    const nonSciData = Object.values(data.nonSci!)
      .map(arr =>
        barMedian ?
          Math.floor(getMedian(arr)) :
          Math.floor(getAverage(arr))
      );

    const config: ChartConfiguration = {
      type: 'bar' as ChartType,
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Research Average',
            data: isSciData,
            backgroundColor: 'rgba(54, 162, 235, 0.6)',
            borderColor: barCount ? 'rgba(54, 162, 235, 1)' :  'rgba(300, 0, 0, 1)',
            borderWidth: 1
          },
          {
            label: 'Business Average',
            data: nonSciData,
            backgroundColor: 'rgba(255, 99, 132, 0.4)',
            borderColor: barCount ? 'rgba(255, 99, 132, 0.8)':  'rgba(300, 0, 0, 1)',
            borderWidth: 1
          }
        ]
      },
      options: {
        responsive: true,
        scales: {
          x: {
            title: {
              display: true,
              text: 'Category'
            }
          },
          y: {
            title: {
              display: true,
              text: `Findings ${barCount ? 'count' : 'count red'}`
            }
          }
        },
        plugins: {
          legend: { position: 'top' },
          title: {
            display: true,
            text: 'Business vs Research in Findings Categories'
          }
        }
      }
    };
    return config;
  });

  constructor() {
    effect(() => {
      const config = this.TagCloudConfig();
      const chart = this.TagCloudChart();

      if (!chart) return;
      if (config.options) chart.options = config.options;

      chart.data.datasets = config.data!.datasets!;

      chart.update();
    });

    effect(() => {
      const config = this.BarConfig();
      const chart = this.BarChart();

      if (!chart) return;
      if (config.options) chart.options = config.options;

      chart.data.datasets = config.data!.datasets!;

      chart.update();
    });
  }

  ngAfterViewInit(): void {
    this.createFindingsWordCloud();
    this.createFindingsBar();
  }

  private createFindingsWordCloud(): void{
    const canvas = document.getElementById('TagCloudFindings') as HTMLCanvasElement;
    if (canvas) {
      this.TagCloudChart.set(new Chart(canvas, this.TagCloudConfig()));
    }
  }

  private createFindingsBar(): void{
    const canvas = document.getElementById('FindingsBarSciNonSci') as HTMLCanvasElement;
    if (canvas) {
      this.BarChart.set(new Chart(canvas, this.BarConfig()));
    }
  }

  ngOnDestroy(): void {
    const nonReactiveCharts = this.allNonReactivePlots();
    const TagCloudChart = this.TagCloudChart();
    const BarChart = this.BarChart();

    if(TagCloudChart) TagCloudChart.destroy();
    if(BarChart) BarChart.destroy();

    nonReactiveCharts.forEach(chart => chart.destroy());
  }
}
