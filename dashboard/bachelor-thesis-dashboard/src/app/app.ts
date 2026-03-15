import {Component, inject, signal} from '@angular/core';
import {Router, RouterOutlet} from '@angular/router';
import {Chart, registerables} from 'chart.js';
import {BoxAndWiskers, BoxPlotController} from '@sgratzl/chartjs-chart-boxplot';
import {WordCloudController, WordElement} from 'chartjs-chart-wordcloud';

// Register Chart.js components globally
Chart.register(...registerables, BoxPlotController, BoxAndWiskers, WordCloudController, WordElement);


@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('bachelor-thesis-dashboard');
  router = inject(Router);

  goToHome(){
    this.router.navigate([''])
  }
}
