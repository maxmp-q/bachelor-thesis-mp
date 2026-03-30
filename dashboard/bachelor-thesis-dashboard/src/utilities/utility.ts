import {Chart, ChartConfiguration} from 'chart.js';

export const updateChart = (chart: Chart | null, config: ChartConfiguration) => {
  if (!chart) return;
  if (config.options) chart.options = config.options;

  chart.data.labels = config.data!.labels!;
  chart.data.datasets = config.data!.datasets!;

  chart.update();
}
