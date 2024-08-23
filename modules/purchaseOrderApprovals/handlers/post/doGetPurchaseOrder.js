import getPurchaseOrder from '../../database/getPurchaseOrder.js';
export default function handler(request, response) {
    const tenant = (request.body.tenant ?? '');
    const orderNumber = (request.body.orderNumber ?? '');
    const purchaseOrder = getPurchaseOrder(tenant, orderNumber);
    response.json({
        isLoggedIn: true,
        purchaseOrder
    });
}
