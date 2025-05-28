import { fixSaultSteMarie } from '@cityssm/is-sault-ste-marie';
import { Countries } from 'country-and-province';
const acceptedCountries = ['Canada', 'United States'];
export function normalizeCityProvinceCountry(city, province, country) {
    const normalizedCountryName = normalizeCountry(country.trim());
    const normalizedProvinceName = normalizeProvince(province.trim(), normalizedCountryName);
    const normalizedCityName = fixSaultSteMarie(city.trim());
    return {
        city: normalizedCityName,
        country: acceptedCountries.includes(normalizedCountryName)
            ? normalizedCountryName
            : 'Other',
        province: normalizedProvinceName
    };
}
function normalizeCountry(trimmedCountry) {
    let normalizedCountryName = trimmedCountry;
    try {
        normalizedCountryName =
            normalizedCountryName.length <= 2
                ? Countries.byCode(trimmedCountry).name
                : Countries.byName(trimmedCountry).name;
    }
    catch {
        normalizedCountryName = trimmedCountry;
    }
    return normalizedCountryName;
}
function normalizeProvince(trimmedProvince, normalizedCountry) {
    let normalizedProvinceName = trimmedProvince;
    try {
        normalizedProvinceName =
            normalizedProvinceName.length <= 2
                ? Countries.byName(normalizedCountry).provinces?.byCode(trimmedProvince)
                    .name
                : Countries.byCode(normalizedCountry).provinces?.byName(trimmedProvince)
                    .name;
    }
    catch {
        normalizedProvinceName = trimmedProvince;
    }
    return normalizedProvinceName ?? trimmedProvince;
}
