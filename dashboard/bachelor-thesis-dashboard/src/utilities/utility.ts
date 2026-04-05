import {Chart, ChartConfiguration, ChartType} from 'chart.js';
import {ScoredData, Separation} from '../../shared/interface/data-point';
import {DataHelper, getAverage} from '../../shared/data-helper';

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
 * @param subkey1
 */
export const generateBucketLineConfig = (
  key1: keyof ScoredData,
  key2: keyof ScoredData,
  bucketOptions: {
    max: number,
    size: number
  },
  subkey1?: keyof Separation
) => {
  const dataPoints = DataHelper.getScoredData();
  const sciData: ValueMap<number>[] = [];
  const nonSciData: ValueMap<number>[] = [];

  Object.values(dataPoints).forEach(entry => {
    const data = entry.field === "nonSci" ? nonSciData : sciData;

    type Entry = typeof entry;
    type Key = typeof key1;
    type SubKey = keyof Entry[Key];

    const realSubKey = subkey1 as SubKey | undefined;

    data.push({value: Number(DataHelper.getValue(entry, key1, realSubKey)), count: Number(entry[key2])});
  });

  const bucketSize = bucketOptions.size;
  const buckets: Record<number, SciFields<number[]>> = {};

  const bucketMapper = (entry: ValueMap<number>, sci: boolean) => {
    const bucket = Math.floor(entry.count / bucketSize) * bucketSize;
    if(bucket > bucketOptions.max) return;

    if (!buckets[bucket]) buckets[bucket] = { isSci: [], nonSci: []};

    const bucketMap =  buckets[bucket][sci ? "isSci" : "nonSci"];
    if(bucketMap){
      bucketMap.push(entry.value);
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
      const sciAvg = entry.isSci ? getAverage(entry.isSci) : 0;
      const nonSciAvg = entry.nonSci ? getAverage(entry.nonSci) : 0;

      labels.add(`${bucketStart}-${Number(bucketStart) + bucketSize} Sci:${(entry.isSci?.length ?? 0)}, nonSci:${(entry.nonSci?.length ?? 0)}`);
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
          text: `Research and Business in ${key1} ${subkey1 ?? ''} vs ${key2}`
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
            text: `${key1} ${subkey1 ?? ''}`
          }
        }
      }
    }
  };

  return config;
}


export const generateLangBarConfig = (
  min: number,
  key: keyof ScoredData,
  subkey?: keyof Separation
) => {
  const dataPoints = DataHelper.getScoredData();

  const cloneCoverages: Record<string, SciFields<number[]>> = {};

  Object.values(dataPoints).forEach(entry => {
    cloneCoverages[entry.lang] ??= {};

    const bucket = entry.field === 'nonSci' ? 'nonSci' : 'isSci';
    const current = cloneCoverages[entry.lang];

    type Entry = typeof entry;
    type Key = typeof key;
    type SubKey = keyof Entry[Key];

    const realSubKey = subkey as SubKey | undefined;

    current[bucket] ??= [];
    current[bucket].push(Number(DataHelper.getValue(entry, key, realSubKey)))
  });

  const labels: string[] = [];
  const isSciData: number[] = [];
  const nonSciData: number[] = [];

  Object.entries(cloneCoverages).forEach(([lang, entry]) => {
    const isSciAvg = entry.isSci ? getAverage(entry.isSci) : 0;
    const nonSciAvg = entry.nonSci ? getAverage(entry.nonSci) : 0;

    const totalCount = (entry.isSci?.length ?? 0) + (entry.nonSci?.length ?? 0);
    if(totalCount >= min){
      labels.push(
        `${lang} (isSci: ${entry.isSci?.length ?? 0}, nonSci: ${entry.nonSci?.length ?? 0})`
      );

      isSciData.push(isSciAvg);
      nonSciData.push(nonSciAvg);
    }
  });

  const config: ChartConfiguration = {
    type: 'bar' as ChartType,
    data: {
      labels: labels,
      datasets: [
        {
          label: 'Research Average',
          data: isSciData,
          backgroundColor: 'rgba(54, 162, 235, 0.6)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1
        },
        {
          label: 'Business Average',
          data: nonSciData,
          backgroundColor: 'rgba(255, 99, 132, 0.4)',
          borderColor: 'rgba(255, 99, 132, 0.8)',
          borderWidth: 1
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: 'top' },
        title: {
          display: true,
          text: `Business vs Research in ${key} ${subkey ?? ''}`
        }
      }
    }
  };
  return config;
}
