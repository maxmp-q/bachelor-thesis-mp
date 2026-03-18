import {Component, inject} from '@angular/core';
import {Router} from '@angular/router';

@Component({
  selector: 'app-home',
  imports: [],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {
  router = inject(Router)

  goToCloneCoverage() {
    this.router.navigate(['/clone-coverage-chart']);
  }

  goToMethodLength() {
    this.router.navigate(['/method-length-chart']);
  }

  goToCommonCharts() {
    this.router.navigate(['/common-chart']);
  }

  goToFindingsCharts() {
    this.router.navigate(['/findings-chart']);
  }

  goToNestingCharts() {
    this.router.navigate(['/nesting-depth-chart']);
  }
}
