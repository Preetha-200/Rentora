// src/lib/utils/statistics.js

export function getDashboardCounts() {
    return {
        properties: 120,
        users: 85,
        requests: 40,
        leases: 32,
        complaints: 6
    };
}

export function getMonthlyProperties() {
    return [
        { month: "Jan", total: 8 },
        { month: "Feb", total: 12 },
        { month: "Mar", total: 15 },
        { month: "Apr", total: 10 },
        { month: "May", total: 18 },
        { month: "Jun", total: 22 }
    ];
}

export function getMonthlyRentals() {
    return [
        { month: "Jan", total: 5 },
        { month: "Feb", total: 7 },
        { month: "Mar", total: 9 },
        { month: "Apr", total: 6 },
        { month: "May", total: 12 },
        { month: "Jun", total: 14 }
    ];
}

export function getMonthlyUsers() {
    return [
        { month: "Jan", total: 10 },
        { month: "Feb", total: 14 },
        { month: "Mar", total: 20 },
        { month: "Apr", total: 18 },
        { month: "May", total: 25 },
        { month: "Jun", total: 30 }
    ];
}