// Validate Property Inputs

export function validateProperty(data) {

    const errors = [];

    if (!data.title || data.title.trim() === "") {
        errors.push("Property title is required.");
    }

    if (!data.city || data.city.trim() === "") {
        errors.push("City is required.");
    }

    if (!data.location || data.location.trim() === "") {
        errors.push("Location is required.");
    }

    if (!data.propertyType) {
        errors.push("Property type is required.");
    }

    if (!data.bhk) {
        errors.push("BHK is required.");
    }

    if (!data.price || data.price <= 0) {
        errors.push("Price must be greater than 0.");
    }

    return {
        success: errors.length === 0,
        errors
    };
}