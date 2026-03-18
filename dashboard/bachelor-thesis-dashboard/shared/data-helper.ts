import {AnalyzedData, ScoredData, Separation} from './interface/data-point';
import analyzedData from '../../../src/data/analyzed_data.json';


export const getAverage = (arr: number[]): number => arr.reduce((a, b) => a + b, 0) / arr.length;
export const combineSeparations = (a: Separation, b: Separation): Separation=> {return{red: a.red + b.red, yellow: a.yellow + b.yellow, green: a.green + b.green}}

export const getMedian = (array: number[]): number => {
  if (array.length === 0) return 0;

  const sorted = [...array].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);

  return sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid];
}


export class DataHelper{
    private static data_points: Record<string, AnalyzedData> = analyzedData;

    static get getData(): Record<string, AnalyzedData>  {
        return this.data_points;
    }

    static getValue<
      T,
      K extends keyof T,
      Q extends keyof T[K]
    >(
      obj: T,
      keyOfT: K,
      keyOfK?: Q | undefined
    ): T[K] | T[K][Q] {
      const returnable = obj[keyOfT];
      return keyOfK ? returnable[keyOfK] : returnable;
    }

    /** This method calculates all findings and weighted the red Findings * %*/
    private static weightedFindings(entry: AnalyzedData): number {
      let count = 0;
      entry.findings_details.forEach(find => {
        count += find.count + find.countRed * 5; // Gewichtung roter Findings
      });
      return count + entry.findings_count;
    }

    private static weightedSeparation(sep: Separation): number {
      return sep.red * 3 + sep.yellow * 2 + sep.green;
    }

  /**
   * Get a scoring for Filesizes: everything between 50-300 is good!
   * @param avgFileSize
   * @private
   */
    private static fileSizeScore(avgFileSize: number): number {
      const minOptimal = 50;
      const maxOptimal = 300;

      const absoluteMin = 10;
      const absoluteMax = 600;

      if (avgFileSize >= minOptimal && avgFileSize <= maxOptimal) return 1;
      if (avgFileSize < minOptimal) return Math.max(0, (avgFileSize - absoluteMin) / (minOptimal - absoluteMin));
      return Math.max(0, (absoluteMax - avgFileSize) / (absoluteMax - maxOptimal));
    }

    private static normalize(value: number, min: number, max: number): number {
      // if (max === min) return 0;
      // return (value - min) / (max - min);

      // if(max === 0) return 0;
      // return Math.max(0, 1- value / max);

      return 1 - Math.log(1 + value) / Math.log(1 + max);
    }

    private static getScoring(entry: AnalyzedData) {
      /**  Findings per 1000 LOC */
      const findings_density = this.weightedFindings(entry) / (entry.LOC /1000);
      const method_complexity = this.weightedSeparation(entry.method_length);
      const nesting_depth = this.weightedSeparation(entry.nesting_depth);
      const avg_file_size = this.fileSizeScore(entry.LOC / Number(entry.files));
      const clone_coverage = entry.clone_coverage;

      return {
        findings_density,
        clone_coverage,
        method_complexity,
        nesting_depth,
        avg_file_size
      };
    }

  /** This method creates a scoring for every entry with normalized values.
   * The weight is like this:
   *
   * findings_density * 0,3
   * clone_coverage * 0,25
   * method_complexity * 0,2
   * nesting_depth * 0,15
   * avg_file_size * 0,1
   * */
    static getScoredData(): Record<string, ScoredData>  {
      const data: Record<string, AnalyzedData> = this.getData;
      const scoredData: Record<string, ScoredData> = {};

      const metrics = Object.values(data).map(entry => this.getScoring(entry));

      const mins = {
        findings_density: Math.min(...metrics.map(m => m.findings_density)),
        method_complexity: Math.min(...metrics.map(m => m.method_complexity)),
        nesting_depth: Math.min(...metrics.map(m => m.nesting_depth)),
        avg_file_size: Math.min(...metrics.map(m => m.avg_file_size))
      }

      const maxs = {
        findings_density: Math.max(...metrics.map(m => m.findings_density)),
        method_complexity: Math.max(...metrics.map(m => m.method_complexity)),
        nesting_depth: Math.max(...metrics.map(m => m.nesting_depth)),
        avg_file_size: Math.max(...metrics.map(m => m.avg_file_size))
      }

      Object.values(data).map((project, i) => {

        const m = metrics[i];

        const cloneScore = 1 - m.clone_coverage;

        const findingsScore =
          1 - this.normalize(m.findings_density, mins.findings_density, maxs.findings_density);

        const methodScore =
          1 - this.normalize(m.method_complexity, mins.method_complexity, maxs.method_complexity);

        const nestingScore =
          1 - this.normalize(m.nesting_depth, mins.nesting_depth, maxs.nesting_depth);

        const sizeScore =
          this.normalize(m.avg_file_size, mins.avg_file_size, maxs.avg_file_size);

        const qualityScore =
          0.30 * findingsScore +
          0.25 * cloneScore +
          0.20 * methodScore +
          0.15 * nestingScore +
          0.10 * sizeScore;

        scoredData[project.name] = {...project, scoring: qualityScore * 100};
      });
      return scoredData;
    }
}
