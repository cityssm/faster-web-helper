import 'cypress-axe';
const loginPath = '/login';
describe('FASTER Web Helper - Login', () => {
    beforeEach('Loads Page', () => {
        cy.visit(loginPath);
        cy.location('pathname').should('equal', loginPath);
    });
    it('Has no detectable accessibility issues', () => {
        cy.injectAxe();
        cy.checkA11y();
    });
});
