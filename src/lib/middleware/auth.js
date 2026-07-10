// Verify Token

export function verifyToken(user) {

    if (!user) {
        return {
            success: false,
            status: 401,
            message: "Unauthorized. Token is missing."
        };
    }

    return {
        success: true,
        user
    };
}