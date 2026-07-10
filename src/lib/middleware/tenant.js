// Tenant Only

```javascript
export function tenantOnly(user) {

    if (user.role !== "Tenant") {
        return {
            success: false,
            status: 403,
            message: "Access denied. Tenant only."
        };
    }

    return {
        success: true
    };
}