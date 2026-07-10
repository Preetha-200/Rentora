// Resource Ownership Check

export function checkResourceOwnership(userId, ownerId) {

    if (userId !== ownerId) {
        return {
            success: false,
            status: 403,
            message: "You do not own this resource."
        };
    }

    return {
        success: true
    };
}