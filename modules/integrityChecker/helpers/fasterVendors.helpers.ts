import { vendorCategories } from '@cityssm/faster-constants/vendors/vendors.js'

export function splitVendorCategoryString(
  vendorCategory = ''
): Array<(typeof vendorCategories)[number]> {
  return vendorCategory
    .split(',')
    .filter((category) =>
      (vendorCategories as unknown as string[]).includes(category)
    ) as Array<(typeof vendorCategories)[number]>
}
