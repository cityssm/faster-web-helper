import { fixSaultSteMarie } from '@cityssm/is-sault-ste-marie'
import { Countries } from 'country-and-province'

const acceptedCountries = ['Canada', 'United States'] as const

export function normalizeCityProvinceCountry(
  city: string,
  province: string,
  country: string
): {
  city: string
  country: 'Other' | (typeof acceptedCountries)[number]
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
    country: acceptedCountries.includes(
      normalizedCountryName as (typeof acceptedCountries)[number]
    )
      ? (normalizedCountryName as (typeof acceptedCountries)[number])
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
