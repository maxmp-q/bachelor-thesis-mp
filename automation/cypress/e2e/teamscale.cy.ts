import {Teamscale} from "../support/teamscale";

const data_points: DataPoint[] = require("../fixtures/data-points.json");

context("Use Cypress to create all projects in teamscale", () => {

    describe("First steps", () => {

        it('Create Projects', () => {
            Teamscale.open();
            Teamscale.login();

            data_points.forEach(data_point => {
                Teamscale.open();

                Teamscale.enterProjectName(data_point.name);

                Teamscale.setTemplate('Template');

                Teamscale.setAnalysisProfile(data_point.lang);

                Teamscale.addGitRepo(data_point.name, data_point.url)

                Teamscale.createProject
                    .click();
            })
        })

    })
})