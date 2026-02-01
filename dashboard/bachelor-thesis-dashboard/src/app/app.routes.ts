import { Routes } from '@angular/router';
import {CloneCoverageChart} from './clone-coverage-chart/clone-coverage-chart.component';
import {Home} from './home/home';

export const routes: Routes = [
  {
    path: '',
    component: Home
  },
  {
    path: 'clone-coverage-chart',
    component: CloneCoverageChart
  }
];
