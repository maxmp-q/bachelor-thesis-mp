import { Component} from '@angular/core';
import {SeparationPlots} from '../charts/seperation-plots/separation-plots.component';

@Component({
  selector: 'app-method-length-charts',
  imports: [
    SeparationPlots
  ],
  templateUrl: './method-length-charts.html',
  styleUrl: './method-length-charts.scss',
})
export class MethodLengthCharts  {

}
