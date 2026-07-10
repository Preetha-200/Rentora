import { json } from "@sveltejs/kit";

import {
    logInfo,
    logSuccess,
    logWarning,
    logError
} from "$lib/logger/logger";

export async function GET() {

    try {

        logInfo("Fetching all properties.");

        const properties = [];

        logSuccess("Properties fetched successfully.");

        return json({
            success: true,
            data: properties
        });

    } catch (error) {

        logError("Failed to fetch properties.", error);

        return json(
            {
                success: false,
                message: "Server Error"
            },
            { status: 500 }
        );
    }

}