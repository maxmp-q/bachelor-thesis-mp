import { Component, AfterViewInit, OnDestroy } from '@angular/core';
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
  selector: 'app-bar-chart',
  templateUrl: './bar-chart.html',
  styleUrls: ['./bar-chart.scss']
})
export class BarChart implements AfterViewInit, OnDestroy {
  private chart: Chart | null = null;

  ngAfterViewInit(): void {
    this.createChart();
  }

  private createChart(): void {
    const data_points: Record<string, AnalyzedData> = DataHelper.getData;

    const clone_coverages: Record<string, SciFields> = {};

    Object.values(data_points).forEach(data_point => {
      const label = data_point.lang;
      const value = () => {
        const previous = clone_coverages[label];
        if(previous){
          if(data_point.field === 'nonSci'){
            const count = previous.nonSci ? previous.nonSci.count + 1 : 1;
            const value = previous.nonSci ? previous.nonSci.value + data_point.clone_coverage : data_point.clone_coverage;
            return {...previous, nonSci: {value: value, count: count}};
          } else {
            const count = previous.isSci ? previous.isSci.count + 1 : 1;
            const value = previous.isSci ? previous.isSci.value + data_point.clone_coverage : data_point.clone_coverage;
            return {...previous, isSci: {value: value, count: count}};
          }
        } else {
          if(data_point.field === 'nonSci'){
            return {nonSci: {value: data_point.clone_coverage, count: 1}};
          } else {
            return {isSci: {value: data_point.clone_coverage, count: 1}};
          }
        }
      }
      clone_coverages[label] = value();
    });

    const isSciData: number[] = [];
    const nonSciData: number[] = [];

    Object.values(clone_coverages).forEach(entry => {
      isSciData.push(entry.isSci ? entry.isSci.value / entry.isSci.count : 0);
      nonSciData.push(entry.nonSci ? entry.nonSci.value / entry.nonSci.count : 0);
    });

    const labels: string[] = Object.keys(clone_coverages).map(k => {
      const entry = clone_coverages[k];
      return k + " (isSci: " + ( entry.isSci?.count ?? "0") + ", nonSci: " + (entry.nonSci?.count ?? "0") + ")";
    })

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
            backgroundColor: 'rgba(255, 0, 0, 0.6)',
            borderColor: 'rgba(255, 0, 0, 1)',
            borderWidth: 1
          }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'top'
          },
          title: {
            display: true,
            text: 'Business vs Research in Clone Coverage'
          }
        }
      }
    };

    const canvas = document.getElementById('myChart') as HTMLCanvasElement;
    if (canvas) {
      this.chart = new Chart(canvas, config);
    }
  }

  ngOnDestroy(): void {
    if (this.chart) {
      this.chart.destroy();
    }
  }
}
