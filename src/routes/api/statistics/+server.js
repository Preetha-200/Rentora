// src/routes/api/statistics/+server.js

import { json } from "@sveltejs/kit";

import {
    getDashboardCounts,
    getMonthlyProperties,
    getMonthlyRentals,
    getMonthlyUsers
} from "$lib/utils/statistics";

export async function GET() {

    const counts = getDashboardCounts();

    const monthlyProperties = getMonthlyProperties();

    const monthlyRentals = getMonthlyRentals();

    const monthlyUsers = getMonthlyUsers();

    return json({
        success: true,
        counts,
        charts: {
            monthlyProperties,
            monthlyRentals,
            monthlyUsers
        }
    });

}