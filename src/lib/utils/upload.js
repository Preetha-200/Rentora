// src/lib/utils/upload.js

const IMAGE_TYPES = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp"
];

const PDF_TYPE = "application/pdf";

export function validateImage(file) {

    if (!file) {
        return {
            success: false,
            message: "Image file is required."
        };
    }

    if (!IMAGE_TYPES.includes(file.type)) {
        return {
            success: false,
            message: "Only JPG, JPEG, PNG, and WEBP images are allowed."
        };
    }

    return {
        success: true
    };
}

export function validatePDF(file) {

    if (!file) {
        return {
            success: false,
            message: "PDF file is required."
        };
    }

    if (file.type !== PDF_TYPE) {
        return {
            success: false,
            message: "Only PDF files are allowed."
        };
    }

    return {
        success: true
    };
}