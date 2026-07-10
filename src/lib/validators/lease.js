// Validate Lease

export function validateLease(data) {

    const errors = [];

    if (!data.propertyId) {
        errors.push("Property ID is required.");
    }

    if (!data.ownerId) {
        errors.push("Owner ID is required.");
    }

    if (!data.tenantId) {
        errors.push("Tenant ID is required.");
    }

    if (!data.startDate) {
        errors.push("Lease start date is required.");
    }

    if (!data.endDate) {
        errors.push("Lease end date is required.");
    }

    return {
        success: errors.length === 0,
        errors
    };
}