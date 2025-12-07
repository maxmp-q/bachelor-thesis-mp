export class DataHelper{
    private static data_points: DataPoint[] = require("../../../src/data/data.json");

    static get getData(): DataPoint[] {
        return this.data_points;
    }
}