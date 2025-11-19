import {Helper} from "../support/helper";


const data_points: DataPoint[] = require("../fixtures/data-points.json");

context("Use Cypress to create all projects in teamscale", () => {

    describe("First steps", () => {

        it('Create Projects', () => {
            Helper.openAndLogin();



            console.log(data_points[0]);

            cy.get('input#project-name-input')
                .type(data_points[0].name);

            cy.get('i.dropdown.icon')
                .eq(1)
                .click();

            cy.get('div.item')
                .contains('Template')
                .click();

            cy.get('input.search')
                .eq(1)
                .type(data_points[0].lang);

            cy.get('div.item')
                .contains('(default)')
                .click();

            cy.get('button#add-connector-button-SOURCE_CODE_REPOSITORY')
                .click();

            cy.get('div.link.item')
                .eq(9)
                .click();



            data_points.forEach(data_point => {

            })
        })

    })
})