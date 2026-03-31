import {AfterViewInit, Component, OnDestroy, signal} from '@angular/core';
import { ScoredData} from '../../../shared/interface/data-point';
import {DataHelper, getAverage} from '../../../shared/data-helper';
import {Chart, ChartConfiguration, ChartType} from 'chart.js';
import {ScatterPlot} from '../charts/scatter-plot/scatter-plot';
import {FieldBarPlot} from '../charts/field-bar-plot/field-bar-plot';
import {generateBucketLineConfig} from '../../utilities/utility';

@Component({
  selector: 'app-common-charts',
  imports: [
    ScatterPlot,
    FieldBarPlot
  ],
  templateUrl: './common-charts.html',
  styleUrl: './common-charts.scss',
})
export class CommonCharts implements AfterViewInit, OnDestroy{
  dataPoints = signal<Record<string, ScoredData>>(DataHelper.getScoredData());

  allNonReactivePlots = signal<Chart[]>([]);

  ngAfterViewInit(): void {
    this.createScoringLine();
    this.createAverageScoring();
    this.createScoringBoxplot();
  }

  /**
   * Creates two pie charts where average clone coverage is
   * displayed by Sci and NonSci.
   * @private
   */
  private createScoringLine(): void {
    const config = generateBucketLineConfig('scoring', 'LOC', {max: 99999, size: 10000});
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
      const scope = entry.field === "nonSci" ? averageNonSci : averageSci;
      scope.push(entry.scoring);
    });

    const barConfig: ChartConfiguration = {
      type: 'bar' as ChartType,
      data: {
        labels: ['Average Scoring in Business and Research'],
        datasets: [
          {
            label: 'Research Software (count: ' + averageSci.length + ')',
            data: [getAverage(averageSci)],
            backgroundColor: 'rgba(54, 162, 235, 0.6)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 1
          },
          {
            label: 'Business Software (count: ' + averageNonSci.length + ')',
            data: [getAverage(averageNonSci)],
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
   * Creates a boxplot where Scoring is display in Research and Business!
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
