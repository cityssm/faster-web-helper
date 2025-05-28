declare const acceptedCountries: readonly ["Canada", "United States"];
export declare function normalizeCityProvinceCountry(city: string, province: string, country: string): {
    city: string;
    country: 'Other' | (typeof acceptedCountries)[number];
    province: string;
};
export {};
