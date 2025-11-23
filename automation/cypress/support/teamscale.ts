import {git_hub, teamscale} from "./credentials";

export class Teamscale {
    /**
     * This function logs you in. PLEASE fill in your username and password!
     */
    static login(){
        cy.get('input#username')
            .type(teamscale.username);

        cy.get('input#password')
            .type(teamscale.password);

        cy.get('button#login-button')
            .click();
    }

    /**
     * This functions opens Teamscale at a new project.
     */
    static open(){
        cy.visit("https://teamscale.cs.uni-koeln.de/project/project?name=%3Anew");
    }

    /**
     * Project Name field.
     */
    static enterProjectName(name: string){
        cy.get('input#project-name-input')
            .type(name);
    }

    /**
     * Select Template. Default is "Template", maybe use normal dashboard instead.
     */
    static setTemplate(template: string = "Template"){
        cy.get('i.dropdown.icon')
            .eq(1)
            .click();

        cy.get('div.item')
            .contains(template)
            .click();
    }

    //TODO: profile will be a keyof
    static setAnalysisProfile(profile: string){
        cy.get('input.search')
            .eq(1)
            .type(profile);

        cy.get('div.item')
            .contains('(default)')
            .click();
    }

    /**
     * Add Source Code button.
     */
    static get addSRCCode(){
        return cy.get('button#add-connector-button-SOURCE_CODE_REPOSITORY');
    }

    /**
     * Use git as a connector for source code.
     */
    static get gitConnector(){
        return cy.get('div.link.item')
            .eq(9);
    }

    /**
     * Create a github connector account and adds it to the projects.
     */
    static addGitRepo(name: string, url: string){
        this.addSRCCode.click();
        this.gitConnector.click();

        cy.get('button[title="Add new account"]')
            .click();

        cy.get('input[name="credentialsName"]')
            .type(name);

        cy.get('input[name="uri"]')
            .type(url);

        cy.get('input[name="username"]')
            .type(git_hub.username);

        cy.get('input[name="password"]')
            .type(git_hub.password);

        cy.get('button[data-testid="external-credentials-save"]')
            .click();
    }

    /**
     * Create Project Button.
     */
    static get createProject(){
        return cy.get('button#create-button');
    }
}