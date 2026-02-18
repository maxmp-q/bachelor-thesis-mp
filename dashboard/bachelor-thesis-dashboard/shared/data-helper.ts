import {AnalyzedData} from './interface/data-point';
import analyzedData from '../../../src/data/analyzed_data.json';

export class DataHelper{
    private static data_points: Record<string, AnalyzedData> = analyzedData;

    static get getData(): Record<string, AnalyzedData>  {
        return this.data_points;
    }

    static getValue<T, K extends keyof T>(obj: T, key: K): T[K] {
      return obj[key];
    }
}
