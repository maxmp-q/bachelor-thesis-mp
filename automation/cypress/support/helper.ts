export class Helper{

    /**
     * Opens Teamscale at new project page and logins in. PLEASE fill in your username and password!
     */
    static openAndLogin(){
        cy.visit("https://teamscale.cs.uni-koeln.de/project/project?name=%3Anew");

        cy.get('input#username')
            .type(''); //TODO: Type username here to login!!!

        cy.get('input#password')
            .type(''); //TODO: Type password here to login!!!

        cy.get('button#login-button')
            .click();
    }
}