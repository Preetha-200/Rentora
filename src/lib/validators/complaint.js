// Validate Complaint

export function validateComplaint(data) {

    const errors = [];

    if (!data.propertyId) {
        errors.push("Property ID is required.");
    }

    if (!data.subject || data.subject.trim() === "") {
        errors.push("Complaint subject is required.");
    }

    if (!data.description || data.description.trim() === "") {
        errors.push("Complaint description is required.");
    }

    return {
        success: errors.length === 0,
        errors
    };
}