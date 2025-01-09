import type { FasterApiResponse, FasterApiResponseWithCollectionResult, ItemRequestResult } from '@cityssm/faster-api';
export declare function getRepairIdsToRefresh(): number[];
interface SummarizedItemRequests {
    itemRequestsCount: number;
    maxItemRequestId: number;
}
export declare function summarizeItemRequests(itemRequestsResponse: FasterApiResponse<FasterApiResponseWithCollectionResult<ItemRequestResult>>): SummarizedItemRequests;
export {};
