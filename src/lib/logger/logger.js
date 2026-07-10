// src/lib/logger/logger.js

export function logInfo(message) {
    console.log(`[INFO] ${new Date().toISOString()} - ${message}`);
}

export function logSuccess(message) {
    console.log(`[SUCCESS] ${new Date().toISOString()} - ${message}`);
}

export function logWarning(message) {
    console.warn(`[WARNING] ${new Date().toISOString()} - ${message}`);
}

export function logError(message, error = null) {
    console.error(`[ERROR] ${new Date().toISOString()} - ${message}`);

    if (error) {
        console.error(error);
    }
}