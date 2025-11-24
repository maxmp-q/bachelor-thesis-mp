export class DataHelper{
    private static data_points: DataPoint[] = require("../fixtures/data.json");

    static get getData(): DataPoint[] {
        return this.data_points
    }
}