import {Teamscale} from "../support/teamscale";

const data_points: DataPoint[] = require("../fixtures/data-points.json");

context("Use Cypress to create all projects in teamscale", () => {
    describe("Create Projects in a loop", () => {
        before(() => {
            Teamscale.open();
            Teamscale.login();
        })

        beforeEach(()=> {
            Teamscale.open();
        })

        data_points.forEach(data_point => {
            it('Create Project: ' + data_point.name, () => {
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