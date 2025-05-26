import { vendorCategories } from '@cityssm/faster-constants/vendors/vendors.js';
export function splitVendorCategoryString(vendorCategory = '') {
    return vendorCategory
        .split(',')
        .filter((category) => vendorCategories.includes(category));
}
