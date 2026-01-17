import {Teamscale} from "../support/teamscale";
import {DataHelper} from "../support/data-helper";

const data_points: Record<string, DataPoint>  = DataHelper.getData;

context("Use Cypress to create all projects in teamscale", () => {
    describe("Create Projects in a loop", () => {
        beforeEach(()=> {
            Teamscale.open();
            Teamscale.login();
        })

        Object.values(data_points).forEach(data_point => {
            it('Create Project: ' + data_point.name, () => {

                cy.intercept('POST', 'https://teamscale.cs.uni-koeln.de/api/projects')
                    .as('createProject');

                Teamscale.enterProjectName(data_point.name);

                Teamscale.setAnalysisProfile(data_point.lang_profile);

                Teamscale.addGitRepo(data_point);

                Teamscale.createProject
                    .click();

                cy.wait('@createProject');
            })
        })
    })
})