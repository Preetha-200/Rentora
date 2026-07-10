// Validate Rental Request

export function validateRentalRequest(data) {

    const errors = [];

    if (!data.propertyId) {
        errors.push("Property ID is required.");
    }

    if (!data.tenantId) {
        errors.push("Tenant ID is required.");
    }

    if (!data.moveInDate) {
        errors.push("Move-in date is required.");
    }

    return {
        success: errors.length === 0,
        errors
    };
}