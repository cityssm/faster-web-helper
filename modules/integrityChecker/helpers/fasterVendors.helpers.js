export function splitVendorCategoryString(vendorCategory = '') {
    return vendorCategory
        .split(',')
        .filter((category) => ['Asset', 'Fuel', 'Inventory', 'Sublet'].includes(category));
}
