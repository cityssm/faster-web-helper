import { getConfigProperty } from '../../../../helpers/functions.config.js';
export default function handler(request, response) {
    response.json({
        domain: getConfigProperty('modules.purchaseOrderApprovals.domain')
    });
}
