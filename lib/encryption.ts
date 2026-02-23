import crypto from "crypto";

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY; // Must be 32 bytes (256 bits)
const IV_LENGTH = 16; // For AES, this is always 16

/**
 * Encrypts sensitive text using AES-256-GCM
 */
export function encrypt(text: string): string {
    if (!ENCRYPTION_KEY) {
        throw new Error("ENCRYPTION_KEY is not defined in environment variables.");
    }

    // Ensure key is 32 bytes
    const keyBuffer = Buffer.from(ENCRYPTION_KEY, "hex");
    if (keyBuffer.length !== 32) {
        throw new Error("ENCRYPTION_KEY must be a 32-byte hex string (64 characters).");
    }

    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv("aes-256-gcm", keyBuffer, iv);

    let encrypted = cipher.update(text, "utf8", "hex");
    encrypted += cipher.final("hex");

    const authTag = cipher.getAuthTag().toString("hex");

    // Format: iv:authTag:encryptedData
    return `${iv.toString("hex")}:${authTag}:${encrypted}`;
}

/**
 * Decrypts text encrypted using AES-256-GCM
 */
export function decrypt(encryptedText: string): string {
    if (!ENCRYPTION_KEY) {
        throw new Error("ENCRYPTION_KEY is not defined in environment variables.");
    }

    const keyBuffer = Buffer.from(ENCRYPTION_KEY, "hex");
    const parts = encryptedText.split(":");
    if (parts.length !== 3) {
        throw new Error("Invalid encrypted text format.");
    }

    const iv = Buffer.from(parts[0], "hex");
    const authTag = Buffer.from(parts[1], "hex");
    const encryptedData = parts[2];

    const decipher = crypto.createDecipheriv("aes-256-gcm", keyBuffer, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encryptedData, "hex", "utf8");
    decrypted += decipher.final("utf8");

    return decrypted;
}
