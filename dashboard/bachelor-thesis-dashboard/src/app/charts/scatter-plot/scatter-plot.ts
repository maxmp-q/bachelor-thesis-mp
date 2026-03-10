import {AfterViewInit, Component, computed, effect, input, OnDestroy, OnInit, signal} from '@angular/core';
import {AnalyzedData, Separation} from '../../../../shared/interface/data-point';
import {DataHelper} from '../../../../shared/data-helper';
import {Chart, ChartConfiguration} from 'chart.js';
import {FormsModule} from '@angular/forms';

@Component({
  selector: 'app-scatter-plot',
  imports: [
    FormsModule
  ],
  templateUrl: './scatter-plot.html',
  styleUrl: './scatter-plot.scss',
})
export class ScatterPlot implements AfterViewInit, OnDestroy, OnInit {
  dataPoints = signal<Record<string, AnalyzedData>>(DataHelper.getData);

  // Important Inputs for first Key
  /** Must be a keyof AnalyzedData like LOC, Forks or Authors */
  key1 = input<keyof AnalyzedData>('LOC');
  /** Is a sub key of AnalyzedData from Separations*/
  sub_key1 = input<keyof Separation | undefined>();
  /** Initial Max Value for key1 */
  max_key1 = input<number>(0);
  /** Increase/Decrease Value for key1 */
  changeValue_key1 = input<number>(0);


  // Important Inputs for second Key
  /** Must be a keyof AnalyzedData like Clone Coverage, Method Length, Nesting Depth */
  key2 = input<keyof AnalyzedData>('clone_coverage');
  /** Initial Max Value for key2 */
  max_key2 = input<number>(0);
  /** Increase/Decrease Value for key2 */
  changeValue_key2 = input<number>(0);

  //Other Inputs
  /** Here another metric can be passed */
  borderRadius = input<keyof AnalyzedData | undefined>();

  //Other Important Signals
  ScatterPlot= signal<Chart | null>(null);
  radiusByKey = signal<boolean>(false);


  // Everything needed for the select!
  selectOption = input<keyof AnalyzedData | undefined>();
  selected = signal<string | undefined>(undefined);
  selectOptions = computed(() => {
    const dataPoints = this.dataPoints();
    const selectOption = this.selectOption();

    const possibleOptions: Set<string> = new Set<string>();
    if(selectOption){
      Object.values(dataPoints).forEach(entry => {
        possibleOptions.add(DataHelper.getValue(entry, selectOption) as string);
      });
    }
    return [...possibleOptions];
  })

  localMax_key1 = signal<number>(0);
  localMax_key2 = signal<number>(0);
  scatterPlotConfig = computed<ChartConfiguration<'scatter'>>(() => {
    const dataPoints = this.dataPoints();
    const key1 = this.key1();
    const max1 = this.localMax_key1();

    const key2 = this.key2();
    const max2 = this.localMax_key2();

    const borderRadius = this.borderRadius();
    const radiusByKey = this.radiusByKey();

    const selected = this.selected();
    const selectOption = this.selectOption();

    const sciValues: ValueMap<number>[] = [];
    const nonSciValues: ValueMap<number>[] = [];
    const sciRadius: number[] = [];
    const nonSciRadius: number[] = [];

    Object.values(dataPoints).forEach(entry => {
      type Entry = typeof entry;
      type Key1 = typeof key1;
      type SubKey = keyof Entry[Key1];

      const subKey = this.sub_key1() as SubKey | undefined;

      //Get the values depending on the key and sub_key
      const value1 = Number(DataHelper.getValue(entry, key1, subKey));
      const value2 = Number(DataHelper.getValue(entry, key2));

      //Check if values should be passed
      const passesValueFilter = value1 < max1 && value2 < max2;
      const passesSelectFilter =
        !selected || !selectOption || selected === DataHelper.getValue(entry, selectOption);

      if (!passesValueFilter || !passesSelectFilter) return;

      // Sci or NonSci
      const targetValues = entry.field === "nonSci" ? nonSciValues : sciValues;
      const targetRadius = entry.field === "nonSci" ? nonSciRadius : sciRadius;

      targetValues.push({ count: value1, value: value2 });

      // Add borderradius if wanted
      if (borderRadius && radiusByKey) {
        const radius = Number(DataHelper.getValue(entry, borderRadius));
        targetRadius.push(10 * Math.log(1 + radius));
      }
    });

    const researchPoints = sciValues.map((entry) => ({ x: entry.count, y: entry.value }));
    const businessPoints = nonSciValues.map((entry) => ({ x: entry.count, y: entry.value }));

    const config: ChartConfiguration<'scatter'> = {
      type: 'scatter',
      data: {
        datasets: [
          {
            label: 'Research',
            data: researchPoints,
            backgroundColor: 'rgba(54, 162, 235, 0.8)',
            pointRadius: this.borderRadius() && this.radiusByKey() ? sciRadius : 5
          },
          {
            label: 'Business',
            data: businessPoints,
            backgroundColor: 'rgba(255, 99, 132, 0.8)',
            pointRadius: this.borderRadius() && this.radiusByKey() ? nonSciRadius : 5
          }
        ]
      },
      options: {
        responsive: true,
        scales: {
          x: {
            type: 'linear',
            title: {
              display: true,
              text: this.key1()
            }
          },
          y: {
            title: {
              display: true,
              text: this.key2()
            }
          }
        },
        plugins: {
          legend: {
            position: 'top'
          }
        }
      }
    };
    return config;
  });

  ngOnInit(): void {
    this.localMax_key1.set(this.max_key1());
    this.localMax_key2.set(this.max_key2());
  }

  ngAfterViewInit(): void {
    this.createScatterPlot();
  }

  constructor() {
    effect(() => {
      const config = this.scatterPlotConfig();
      const chart = this.ScatterPlot();

      if (!chart) return;
      if (config.options) chart.options = config.options;

      chart.data.datasets = config.data!.datasets!;

      chart.update();
    });
  }

  /**
   * Creates a scatter plot where the dots are sorted by key1 and key2!
   * @private
   */
  private createScatterPlot(): void {
    const canvas = document.getElementById(`ScatterPlot${this.key1() + this.key2()}`) as HTMLCanvasElement;
    if (canvas) {
      this.ScatterPlot.set(new Chart(canvas, this.scatterPlotConfig()));
    }
  }

  ngOnDestroy(): void {
    const ScatterPlot = this.ScatterPlot();
    if (ScatterPlot) ScatterPlot.destroy();
  }
}
