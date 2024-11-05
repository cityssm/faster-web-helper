export default function handler(request, response) {
    response.render('inventoryScanner/scanner', {
        headTitle: 'Inventory Scanner'
    });
}
