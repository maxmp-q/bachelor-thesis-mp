import {Chart, ChartConfiguration} from 'chart.js';
import {ScoredData} from '../../shared/interface/data-point';
import {DataHelper} from '../../shared/data-helper';

export const updateChart = (chart: Chart | null, config: ChartConfiguration) => {
  if (!chart) return;
  if (config.options) chart.options = config.options;

  chart.data.labels = config.data!.labels!;
  chart.data.datasets = config.data!.datasets!;

  chart.update();
}

/**
 * This method returns a line chart config, with size being the bucket size.
 * key1 and key2 must be a number.
 * key1 is the main metric, key2 is the bucket metric
 * @param bucketOptions
 * @param key1
 * @param key2
 */
export const generateBucketLineConfig = (
  key1: keyof ScoredData,
  key2: keyof ScoredData,
  bucketOptions: {
    max: number,
    size: number
  }
) => {
  const dataPoints = DataHelper.getScoredData();
  const sciData: ValueMap<number>[] = [];
  const nonSciData: ValueMap<number>[] = [];

  Object.values(dataPoints).forEach(entry => {
    const data = entry.field === "nonSci" ? nonSciData : sciData;
    data.push({value: Number(entry[key1]), count: Number(entry[key2])});
  });

  const bucketSize = bucketOptions.size;
  const buckets: Record<number, SciFields<ValueMap<number>>> = {};

  const bucketMapper = (entry: ValueMap<number>, sci: boolean) => {
    const bucket = Math.floor(entry.count / bucketSize) * bucketSize;
    if(bucket > bucketOptions.max) return;

    if (!buckets[bucket]) buckets[bucket] = { isSci: {value: 0, count: 0}, nonSci: {value: 0, count: 0}};

    const bucketMap =  buckets[bucket][sci ? "isSci" : "nonSci"];
    if(bucketMap){
      bucketMap.value += entry.value;
      bucketMap.count += 1;
    }
  }

  sciData.forEach(entry => bucketMapper(entry, true));
  nonSciData.forEach(entry => bucketMapper(entry, false));

  const labels: Set<string> = new Set<string>();
  const sciAverages: number[] = [];
  const nonSciAverages: number[] = [];


  Object.entries(buckets)
    .sort((a, b) => Number(a[0]) - Number(b[0]))
    .forEach(([bucketStart, entry]) => {
      const sciAvg = entry.isSci ? entry.isSci.value / entry.isSci.count : 0;
      const nonSciAvg = entry.nonSci ? entry.nonSci.value / entry.nonSci.count : 0;

      labels.add(`${bucketStart}-${Number(bucketStart) + bucketSize} Sci:${(entry.isSci?.count ?? 0)}, nonSci:${(entry.nonSci?.count ?? 0)}`);
      sciAverages.push(sciAvg);
      nonSciAverages.push(nonSciAvg);
    });

  const labelsAsArray = Array.from(labels);

  const config: ChartConfiguration<'line'> = {
    type: 'line',
    data: {
      labels: labelsAsArray,
      datasets: [
        {
          label: `Research ${key1}`,
          data: sciAverages,
          borderColor: 'rgba(54, 162, 235, 0.8)',
          tension: 0.3
        },
        {
          label: `Business ${key1}`,
          data: nonSciAverages,
          borderColor: 'rgba(255, 99, 132, 0.8)',
          tension: 0.3
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {position: 'top'},
        title: {
          display: true,
          text: `Research and Business in ${key1} vs ${key2}`
        }
      },
      scales: {
        x: {
          title:{
            display: true,
            text: key2
          }
        },
        y: {
          title:{
            display: true,
            text: key1
          }
        }
      }
    }
  };

  return config;
}
