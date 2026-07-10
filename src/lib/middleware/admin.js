// Admin Only

export function adminOnly(user) {

    if (user.role !== "Admin") {
        return {
            success: false,
            status: 403,
            message: "Access denied. Admin only."
        };
    }

    return {
        success: true
    };
}