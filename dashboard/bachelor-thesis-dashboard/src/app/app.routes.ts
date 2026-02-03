import { Routes } from '@angular/router';
import {CloneCoverageChart} from './clone-coverage-chart/clone-coverage-chart.component';
import {Home} from './home/home';
import {MethodLengthCharts} from './method-length-charts/method-length-charts';

export const routes: Routes = [
  {
    path: '',
    component: Home
  },
  {
    path: 'clone-coverage-chart',
    component: CloneCoverageChart
  },
  {
    path: 'method-length-chart',
    component: MethodLengthCharts
  }
];
