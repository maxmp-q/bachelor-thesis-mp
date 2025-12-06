import {Teamscale} from "../support/teamscale";
import {DataHelper} from "../support/data-helper";

const data_points: DataPoint[] = DataHelper.getData;

context("Use Cypress to create all projects in teamscale", () => {
    describe("Create Projects in a loop", () => {
        beforeEach(()=> {
            Teamscale.open();
            Teamscale.login();
        })

        data_points.forEach(data_point => {
            it('Create Project: ' + data_point.name, () => {
                Teamscale.enterProjectName(data_point.name);

                Teamscale.setTemplate('Overview Dashboard');

                Teamscale.setAnalysisProfile(data_point.lang_profile);

                Teamscale.addGitRepo(data_point.name, data_point.url)

                Teamscale.createProject
                    .click();
            })
        })
    })
})