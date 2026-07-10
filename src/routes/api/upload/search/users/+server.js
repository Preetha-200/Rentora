// src/routes/api/users/+server.js

import { json } from "@sveltejs/kit";

// Sample Users
let users = [
    {
        id: 1,
        name: "Afrin",
        email: "afrin@example.com",
        role: "Owner",
        status: "Active"
    },
    {
        id: 2,
        name: "Rahul",
        email: "rahul@example.com",
        role: "Tenant",
        status: "Active"
    },
    {
        id: 3,
        name: "Priya",
        email: "priya@example.com",
        role: "Owner",
        status: "Disabled"
    }
];

// GET: All users / Owners / Tenants
export async function GET({ url }) {
    const role = url.searchParams.get("role");

    if (!role) {
        return json({
            success: true,
            count: users.length,
            data: users
        });
    }

    const filteredUsers = users.filter(
        user => user.role.toLowerCase() === role.toLowerCase()
    );

    return json({
        success: true,
        count: filteredUsers.length,
        data: filteredUsers
    });
}

// PATCH: Enable / Disable User
export async function PATCH({ request }) {
    const { id, action } = await request.json();

    const user = users.find(u => u.id === id);

    if (!user) {
        return json(
            {
                success: false,
                message: "User not found"
            },
            { status: 404 }
        );
    }

    if (action === "enable") {
        user.status = "Active";
    } else if (action === "disable") {
        user.status = "Disabled";
    } else {
        return json(
            {
                success: false,
                message: "Invalid action"
            },
            { status: 400 }
        );
    }

    return json({
        success: true,
        message: `User ${action}d successfully`,
        data: user
    });
}

// DELETE: Delete User
export async function DELETE({ request }) {
    const { id } = await request.json();

    const index = users.findIndex(u => u.id === id);

    if (index === -1) {
        return json(
            {
                success: false,
                message: "User not found"
            },
            { status: 404 }
        );
    }

    users.splice(index, 1);

    return json({
        success: true,
        message: "User deleted successfully"
    });
}