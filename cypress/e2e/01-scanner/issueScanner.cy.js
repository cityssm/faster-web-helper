import 'cypress-axe';
const scannerPath = '/apps/inventoryScanner';
describe('Issue Scanner', () => {
    beforeEach('Loads Page', () => {
        cy.visit(scannerPath);
        cy.location('pathname').should('contain', scannerPath);
    });
    it('Has no detectable accessibility issues', () => {
        cy.injectAxe();
        cy.checkA11y();
    });
});
