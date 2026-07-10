// src/routes/api/upload/+server.js

import { json } from "@sveltejs/kit";
import {
    validateImage,
    validatePDF
} from "$lib/utils/upload";

export async function POST({ request }) {

    try {

        const formData = await request.formData();

        const file = formData.get("file");

        const uploadType = formData.get("type");

        let validation;

        if (uploadType === "image") {

            validation = validateImage(file);

        } else if (uploadType === "pdf") {

            validation = validatePDF(file);

        } else {

            return json({
                success: false,
                message: "Invalid upload type."
            }, { status: 400 });

        }

        if (!validation.success) {

            return json(validation, {
                status: 400
            });

        }

        // Storage logic can be added here later

        return json({

            success: true,

            message: "File uploaded successfully.",

            fileName: file.name,

            fileType: file.type,

            fileSize: file.size

        });

    } catch (error) {

        return json({

            success: false,

            message: error.message

        }, { status: 500 });

    }

}

export async function DELETE({ request }) {

    try {

        const { fileName } = await request.json();

        if (!fileName) {

            return json({

                success: false,

                message: "File name is required."

            }, { status: 400 });

        }

        // Delete logic can be added here later

        return json({

            success: true,

            message: `${fileName} deleted successfully.`

        });

    } catch (error) {

        return json({

            success: false,

            message: error.message

        }, { status: 500 });

    }

}