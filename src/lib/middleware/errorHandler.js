// src/lib/middleware/errorHandler.js

import { json } from "@sveltejs/kit";

// 400 Bad Request
export function badRequest(message = "Bad Request") {
    return json(
        {
            success: false,
            status: 400,
            message
        },
        { status: 400 }
    );
}

// 401 Unauthorized
export function unauthorized(message = "Unauthorized") {
    return json(
        {
            success: false,
            status: 401,
            message
        },
        { status: 401 }
    );
}

// 403 Forbidden
export function forbidden(message = "Forbidden") {
    return json(
        {
            success: false,
            status: 403,
            message
        },
        { status: 403 }
    );
}

// 404 Not Found
export function notFound(message = "Resource Not Found") {
    return json(
        {
            success: false,
            status: 404,
            message
        },
        { status: 404 }
    );
}

// 500 Internal Server Error
export function serverError(message = "Internal Server Error") {
    return json(
        {
            success: false,
            status: 500,
            message
        },
        { status: 500 }
    );
}