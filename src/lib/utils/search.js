// src/lib/utils/search.js

export function searchProperties(properties, filters) {

    let result = [...properties];

    // Search by Location
    if (filters.location) {
        result = result.filter(property =>
            property.location.toLowerCase().includes(
                filters.location.toLowerCase()
            )
        );
    }

    // Search by City
    if (filters.city) {
        result = result.filter(property =>
            property.city.toLowerCase() ===
            filters.city.toLowerCase()
        );
    }

    // Search by Maximum Price
    if (filters.price) {
        result = result.filter(property =>
            property.price <= Number(filters.price)
        );
    }

    // Search by Property Type
    if (filters.propertyType) {
        result = result.filter(property =>
            property.propertyType.toLowerCase() ===
            filters.propertyType.toLowerCase()
        );
    }

    // Search by BHK
    if (filters.bhk) {
        result = result.filter(property =>
            property.bhk == filters.bhk
        );
    }

    // Search by Furnished
    if (filters.furnished) {
        result = result.filter(property =>
            property.furnished === filters.furnished
        );
    }

    // Search by Available
    if (filters.available) {
        result = result.filter(property =>
            property.available === filters.available
        );
    }

    return result;
}

export function sortProperties(properties, sort) {

    switch (sort) {

        case "priceAsc":
            return [...properties].sort((a, b) => a.price - b.price);

        case "priceDesc":
            return [...properties].sort((a, b) => b.price - a.price);

        case "latest":
            return [...properties].sort((a, b) => b.createdAt - a.createdAt);

        case "oldest":
            return [...properties].sort((a, b) => a.createdAt - b.createdAt);

        default:
            return properties;
    }
}