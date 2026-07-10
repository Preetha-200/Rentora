// src/routes/api/search/+server.js

import { json } from "@sveltejs/kit";
import {
    searchProperties,
    sortProperties
} from "$lib/utils/search";

// Sample data (Replace with database later)
const properties = [
    {
        id: 1,
        title: "Luxury Apartment",
        city: "Salem",
        location: "Hasthampatti",
        propertyType: "Apartment",
        bhk: 2,
        furnished: true,
        available: true,
        price: 12000,
        createdAt: 1711000000
    },
    {
        id: 2,
        title: "Villa",
        city: "Chennai",
        location: "Anna Nagar",
        propertyType: "Villa",
        bhk: 3,
        furnished: false,
        available: true,
        price: 25000,
        createdAt: 1712000000
    }
];

export async function GET({ url }) {

    const filters = {
        location: url.searchParams.get("location"),
        city: url.searchParams.get("city"),
        price: url.searchParams.get("price"),
        propertyType: url.searchParams.get("propertyType"),
        bhk: url.searchParams.get("bhk"),
        furnished: url.searchParams.get("furnished") === "true",
        available: url.searchParams.get("available") === "true"
    };

    const sort = url.searchParams.get("sort");

    let result = searchProperties(properties, filters);

    result = sortProperties(result, sort);

    return json({
        success: true,
        count: result.length,
        data: result
    });
}