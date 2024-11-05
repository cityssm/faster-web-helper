export default function handler(request, response) {
    response.render('inventoryScanner/dashboard', {
        headTitle: 'Inventory Scanner'
    });
}
