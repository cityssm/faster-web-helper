import createPurchaseOrder from '../../database/createPurchaseOrder.js';
import getPurchaseOrder from '../../database/getPurchaseOrder.js';
export default function handler(request, response) {
    const user = request.session
        .purchaseOrderApprovalUser;
    if (user.approvalMax <= 0) {
        response.json({
            isLoggedIn: true,
            success: false,
            message: 'You do not have permission to approve purchase orders.'
        });
        return;
    }
    const tenant = (request.body.tenant ?? '');
    const orderNumber = (request.body.orderNumber ?? '');
    const purchaseOrder = getPurchaseOrder(tenant, orderNumber);
    if (purchaseOrder !== undefined) {
        response.json({
            isLoggedIn: true,
            success: false,
            message: 'An approval record already exists for this purchase order.'
        });
        return;
    }
    createPurchaseOrder(request.body, user);
    response.json({
        isLoggedIn: true,
        success: true,
        message: 'Approval record created successfully.'
    });
}
