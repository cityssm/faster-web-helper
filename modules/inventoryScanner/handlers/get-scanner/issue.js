export default function handler(request, response) {
    response.render('inventoryScanner/issueScanner', {
        headTitle: 'Inventory Scanner'
    });
}
