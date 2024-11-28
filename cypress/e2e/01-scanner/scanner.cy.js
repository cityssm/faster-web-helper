import 'cypress-axe';
const scannerPath = '/apps/inventoryScanner';
describe('Inventory Scanner', () => {
    beforeEach('Loads Page', () => {
        cy.visit(scannerPath);
        cy.location('pathname').should('equal', scannerPath);
    });
    it('Has no detectable accessibility issues', () => {
        cy.injectAxe();
        cy.checkA11y();
    });
});
