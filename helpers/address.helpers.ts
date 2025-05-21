import { fixSaultSteMarie } from '@cityssm/is-sault-ste-marie'
import { Countries } from 'country-and-province'

export function normalizeCityProvinceCountry(
  city: string,
  province: string,
  country: string
): {
  city: string
  country: string
  province: string
} {
  const normalizedCountryName = normalizeCountry(country.trim())

  const normalizedProvinceName = normalizeProvince(
    province.trim(),
    normalizedCountryName
  )

  const normalizedCityName = fixSaultSteMarie(city.trim())

  return {
    city: normalizedCityName,
    country: ['Canada', 'United States'].includes(normalizedCountryName)
      ? normalizedCountryName
      : 'Other',
    province: normalizedProvinceName
  }
}

function normalizeCountry(trimmedCountry: string): string {
  let normalizedCountryName = trimmedCountry

  try {
    normalizedCountryName =
      normalizedCountryName.length <= 2
        ? Countries.byCode(trimmedCountry).name
        : Countries.byName(trimmedCountry).name
  } catch {
    normalizedCountryName = trimmedCountry
  }

  return normalizedCountryName
}

function normalizeProvince(
  trimmedProvince: string,
  normalizedCountry: string
): string {
  let normalizedProvinceName: string | undefined = trimmedProvince

  try {
    normalizedProvinceName =
      normalizedProvinceName.length <= 2
        ? Countries.byName(normalizedCountry).provinces?.byCode(trimmedProvince)
            .name
        : Countries.byCode(normalizedCountry).provinces?.byName(trimmedProvince)
            .name
  } catch {
    normalizedProvinceName = trimmedProvince
  }

  return normalizedProvinceName ?? trimmedProvince
}
