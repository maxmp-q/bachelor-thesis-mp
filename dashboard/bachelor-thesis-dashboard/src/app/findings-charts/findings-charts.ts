import {AfterViewInit, Component, computed, effect, OnDestroy, signal} from '@angular/core';
import {AnalyzedData} from '../../../shared/interface/data-point';
import {DataHelper} from '../../../shared/data-helper';
import {Chart, ChartConfiguration} from 'chart.js';
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
  dataPoints = signal<Record<string, AnalyzedData>>(DataHelper.getData);
  allNonReactivePlots = signal<Chart[]>([]);

  findings = computed(() => {
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
    const findings = this.findings();
    const wordCloudCount = this.wordCloudCount();

    const data = (forPlot: boolean) => {
      if(forPlot) {
        return Object.values(findings).map(entry =>  wordCloudCount ? Math.log2(entry.count) * 5 : Math.log2(entry.value) * 5);
      } else {
        return Object.values(findings).map(entry =>  wordCloudCount ? entry.count : entry.value)
      }
    }

    const config: ChartConfiguration<'wordCloud'> = {
      type: 'wordCloud',
      data: {
        labels: Object.keys(findings),
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
  }

  ngAfterViewInit(): void {
    this.createFindingsWordCloud();
  }

  private createFindingsWordCloud(): void{
    const canvas = document.getElementById('TagCloudFindings') as HTMLCanvasElement;
    if (canvas) {
      this.TagCloudChart.set(new Chart(canvas, this.TagCloudConfig()));
    }
  }

  ngOnDestroy(): void {
    const nonReactiveCharts = this.allNonReactivePlots();
    const TagCloudChart = this.TagCloudChart();

    if(TagCloudChart) TagCloudChart.destroy();
    nonReactiveCharts.forEach(chart => chart.destroy());
  }
}
