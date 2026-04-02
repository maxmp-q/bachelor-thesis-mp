import {Component} from '@angular/core';
import {SeparationPlots} from '../charts/seperation-plots/separation-plots.component';

@Component({
  selector: 'app-nesting-depth-charts',
  imports: [
    SeparationPlots
  ],
  templateUrl: './nesting-depth-charts.html',
  styleUrl: './nesting-depth-charts.scss',
})
export class NestingDepthCharts {
}
