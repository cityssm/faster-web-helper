import 'cypress-axe';
const errorPath = '/this/page/does/not/exist';
describe('FASTER Web Helper - Error Page', () => {
    beforeEach('Loads Page', () => {
        cy.visit(errorPath, {
            failOnStatusCode: false
        });
        cy.location('pathname').should('equal', errorPath);
    });
    it('Has no detectable accessibility issues', () => {
        cy.injectAxe();
        cy.checkA11y();
    });
    it('Shows 404 Error', () => {
        cy.get('h1').should('contain', 'Not Found');
        cy.get('h1').should('contain', '404');
    });
    it('Contains a link to return to login', () => {
        cy.get('a').should('contain', 'Return to Login');
    });
});
