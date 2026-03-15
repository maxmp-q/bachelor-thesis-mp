import { Routes } from '@angular/router';
import {CloneCoverageChart} from './clone-coverage-chart/clone-coverage-chart.component';
import {Home} from './home/home';
import {MethodLengthCharts} from './method-length-charts/method-length-charts';
import {CommonCharts} from './common-charts/common-charts';
import {FindingsCharts} from './findings-charts/findings-charts';

export const routes: Routes = [
  {
    path: '',
    component: Home
  },
  {
    path: 'common-chart',
    component: CommonCharts
  },
  {
    path: 'clone-coverage-chart',
    component: CloneCoverageChart
  },
  {
    path: 'method-length-chart',
    component: MethodLengthCharts
  },
  {
    path: 'findings-chart',
    component: FindingsCharts
  }
];
