// Owner Only

export function ownerOnly(user) {

    if (user.role !== "Owner") {
        return {
            success: false,
            status: 403,
            message: "Access denied. Owner only."
        };
    }

    return {
        success: true
    };
}