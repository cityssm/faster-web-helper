import getSetting from '../../database/getSetting.js';
export default function handler(request, response) {
    const itemRequestsCount = Number.parseInt(getSetting('itemRequests.count') ?? '0');
    response.json({ itemRequestsCount });
}
