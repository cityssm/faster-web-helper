export function splitVendorCategoryString(
  vendorCategory = ''
): Array<'Asset' | 'Fuel' | 'Inventory' | 'Sublet'> {
  return vendorCategory
    .split(',')
    .filter((category) =>
      ['Asset', 'Fuel', 'Inventory', 'Sublet'].includes(category)
    ) as Array<'Asset' | 'Fuel' | 'Inventory' | 'Sublet'>
}
