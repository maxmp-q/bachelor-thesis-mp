import {AfterViewInit, Component, computed, effect, OnDestroy, signal} from '@angular/core';
import {ScoredData} from '../../../shared/interface/data-point';
import {DataHelper, getAverage, getMedian} from '../../../shared/data-helper';
import {Chart, ChartConfiguration, ChartType} from 'chart.js';
import {FormsModule} from '@angular/forms';

export const findings = [
  "Comprehensibility",
  "Correctness",
  "Documentation",
  "Efficiency",
  "Error Handling",
  "Redundancy",
  "Structure",
  "Usability",
  "Security"
] as const;
export type Findings = (typeof findings)[number];

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

  LOCBarPer1000 = signal<boolean>(false);
  selectedLOCBarCategory = signal<Findings | undefined>(undefined);
  categorySelectOptions =  findings;
  LOCBarChart = signal<Chart | null>(null);
  LOCBarConfig = computed(()=> {
    const dataPoints = this.dataPoints();
    const LOCBarPer1000 = this.LOCBarPer1000();
    const category = this.selectedLOCBarCategory();

    const data: SciFields<number[]> = {isSci: [], nonSci: []}
    const dataRed: SciFields<number[]> = {isSci: [], nonSci: []}

    Object.values(dataPoints).forEach(point => {
      const scope = point.field === "nonSci" ? "nonSci" : "isSci";
      const divider = LOCBarPer1000 ? (point.LOC / 1000) : 1

      const findingsCount = (val: 'count' | 'countRed') => {
        return point.findings_details
          .filter(find => category ? find.categoryName === category : true)
          .map(find => find[val])
          .reduce((a, b) => a + b, 0);
      };

      data[scope]?.push(findingsCount('count') / divider);
      dataRed[scope]?.push(findingsCount('countRed') / divider);
    });

    const labels: string[] = ["Count", "Count Red"];
    const isSciData: number = getAverage(data.isSci!);
    const nonSciData: number = getAverage(data.nonSci!);
    const isSciDataRed: number = getAverage(dataRed.isSci!);
    const nonSciDataRed: number = getAverage(dataRed.nonSci!);

    const config: ChartConfiguration = {
      type: 'bar' as ChartType,
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Research Average',
            data: [isSciData, isSciDataRed],
            backgroundColor: 'rgba(54, 162, 235, 0.6)',
            borderColor: ['rgba(54, 162, 235, 1)', 'rgba(300, 0, 0, 1)'],
            borderWidth: 1
          },
          {
            label: 'Business Average',
            data: [nonSciData, nonSciDataRed],
            backgroundColor: 'rgba(255, 99, 132, 0.4)',
            borderColor: ['rgba(255, 99, 132, 0.8)', 'rgba(300, 0, 0, 1)'],
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
              text: 'Scope'
            }
          },
          y: {
            title: {
              display: true,
              text: `Findings ${LOCBarPer1000 ? 'per 1000 LOC' : 'count average'} `
            }
          }
        },
        plugins: {
          legend: { position: 'top' },
          title: {
            display: true,
            text: 'Business vs Research in Findings per 1000 LOC'
          }
        }
      }
    };
    return config;
  })

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

    effect(() => {
      const config = this.LOCBarConfig();
      const chart = this.LOCBarChart();

      if (!chart) return;
      if (config.options) chart.options = config.options;

      chart.data.datasets = config.data!.datasets!;

      chart.update();
    });
  }

  ngAfterViewInit(): void {
    this.createFindingsWordCloud();
    this.createFindingsBar();
    this.createFindingsPerLOC();
    this.createFindingsInLine();
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

  private createFindingsPerLOC(): void {
    const canvas = document.getElementById('FindingsPerLOC') as HTMLCanvasElement;
    if (canvas) {
      this.LOCBarChart.set(new Chart(canvas, this.LOCBarConfig()));
    }
  }

  private createFindingsInLine(): void {
    const dataPoints = this.dataPoints();

    const data: SciFields<ValueMap<number>[]> = {isSci: [], nonSci: []}
    const dataRed: SciFields<ValueMap<number>[]> = {isSci: [], nonSci: []}

    Object.values(dataPoints).forEach(point => {
      const scope = point.field === "nonSci" ? "nonSci" : "isSci";

      const findingsCount = (val: 'count' | 'countRed') => {
        return point.findings_details
          .map(find => find[val])
          .reduce((a, b) => a + b, 0);
      };

      data[scope]?.push({value: findingsCount('count'), count: point.LOC});
      dataRed[scope]?.push({value: findingsCount('countRed'), count: point.LOC});
    });

    const bucketSize = 5000;
    const buckets: Record<number, SciFields<ValueMap<number>>> = {};
    const bucketsRed: Record<number, SciFields<ValueMap<number>>> = {};

    const bucketMapper = (entry: ValueMap<number>, sci: boolean, red: boolean) => {
      const bucket = Math.floor(entry.count / bucketSize) * bucketSize;
      const record = red ? bucketsRed : buckets;
      if(bucket > 99999) return;

      if (!record[bucket]) record[bucket] = { isSci: {value: 0, count: 0}, nonSci: {value: 0, count: 0}};

      const bucketMap =  record[bucket][sci ? "isSci" : "nonSci"];
      if(bucketMap){
        bucketMap.value += entry.value;
        bucketMap.count += 1;
      }
    }

    data.isSci?.forEach(entry => bucketMapper(entry, true, false));
    data.nonSci?.forEach(entry => bucketMapper(entry, false, false));

    dataRed.isSci?.forEach(entry => bucketMapper(entry, true, true));
    dataRed.nonSci?.forEach(entry => bucketMapper(entry, false, true));

    const labels: Set<string> = new Set<string>();
    const sciAverages: number[] = [];
    const nonSciAverages: number[] = [];
    const sciAveragesRed: number[] = [];
    const nonSciAveragesRed: number[] = [];


    Object.entries(buckets)
      .sort((a, b) => Number(a[0]) - Number(b[0]))
      .forEach(([bucketStart, entry]) => {
        const sciAvg = entry.isSci ? entry.isSci.value / entry.isSci.count : 0;
        const nonSciAvg = entry.nonSci ? entry.nonSci.value / entry.nonSci.count : 0;

        labels.add(`${bucketStart}-${Number(bucketStart) + bucketSize} Sci:${(entry.isSci?.count ?? 0)}, nonSci:${(entry.nonSci?.count ?? 0)}`);
        sciAverages.push(sciAvg);
        nonSciAverages.push(nonSciAvg);
      });

    Object.entries(bucketsRed)
      .sort((a, b) => Number(a[0]) - Number(b[0]))
      .forEach(([bucketStart, entry]) => {
        const sciAvg = entry.isSci ? entry.isSci.value / entry.isSci.count : 0;
        const nonSciAvg = entry.nonSci ? entry.nonSci.value / entry.nonSci.count : 0;

        labels.add(`${bucketStart}-${Number(bucketStart) + bucketSize} Sci:${(entry.isSci?.count ?? 0)}, nonSci:${(entry.nonSci?.count ?? 0)}`);
        sciAveragesRed.push(sciAvg);
        nonSciAveragesRed.push(nonSciAvg);
      });

    const labelsAsArray = Array.from(labels);

    const config: ChartConfiguration<'line'> = {
      type: 'line',
      data: {
        labels: labelsAsArray,
        datasets: [
          {
            label: 'Research Findings',
            data: sciAverages,
            borderColor: 'rgba(54, 162, 235, 0.8)',
            tension: 0.3,
          },
          {
            label: 'Business Findings',
            data: nonSciAverages,
            borderColor: 'rgba(255, 99, 132, 0.8)',
            tension: 0.3
          },
          {
            label: 'Research Findings Red',
            data: sciAveragesRed,
            borderColor: 'rgba(54, 162, 235, 0.8)',
            pointBorderColor: 'rgba(300, 0, 0, 1)',
            tension: 0.3,
          },
          {
            label: 'Business Findings Red',
            data: nonSciAveragesRed,
            borderColor: 'rgba(255, 99, 132, 0.8)',
            pointBorderColor: 'rgba(300, 0, 0, 1)',
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
            text: 'Research and Business in Findings'
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

    const canvas = document.getElementById('FindingsInLine') as HTMLCanvasElement;
    if(canvas) this.allNonReactivePlots.update(value => [...value, new Chart(canvas, config)]);
  }

  ngOnDestroy(): void {
    const nonReactiveCharts = this.allNonReactivePlots();
    const TagCloudChart = this.TagCloudChart();
    const BarChart = this.BarChart();
    const LOCBarChart = this.LOCBarChart();

    if(TagCloudChart) TagCloudChart.destroy();
    if(BarChart) BarChart.destroy();
    if(LOCBarChart) LOCBarChart.destroy();

    nonReactiveCharts.forEach(chart => chart.destroy());
  }
}
