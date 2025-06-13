export default function handler(request, response) {
    response.render('inventoryScanner/adminInventory', {
        headTitle: 'Inventory Scanner'
    });
}
