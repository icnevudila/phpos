import crypto from "node:crypto";

/**
 * PhilHealth PECWS v3.0 Cryptographic Handshake Service
 * This handles the AES-256-CBC encryption required for e-Claims.
 */
export class PhilHealthHandshakeService {
  private readonly algorithm = "aes-256-cbc";
  private readonly key: Buffer;
  private readonly iv: Buffer;

  constructor(secretKey: string, iv: string) {
    this.key = Buffer.from(secretKey, "hex");
    this.iv = Buffer.from(iv, "hex");
  }

  /**
   * Encrypts the Transmittal XML/JSON for PhilHealth submission.
   */
  encryptPayload(payload: string): string {
    const cipher = crypto.createCipheriv(this.algorithm, this.key, this.iv);
    let encrypted = cipher.update(payload, "utf8", "base64");
    encrypted += cipher.final("base64");
    return encrypted;
  }

  /**
   * Decrypts responses from PhilHealth server.
   */
  decryptResponse(encrypted: string): string {
    const decipher = crypto.createDecipheriv(this.algorithm, this.key, this.iv);
    let decrypted = decipher.update(encrypted, "base64", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
  }

  /**
   * Generates a digital signature (HMAC-SHA256) for the request.
   */
  generateSignature(payload: string, secret: string): string {
    return crypto.createHmac("sha256", secret).update(payload).digest("hex");
  }
}
