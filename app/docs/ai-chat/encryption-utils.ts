/**
 * Simple encryption/decryption utilities for client-side storage
 * Note: This provides only basic obfuscation, not true security
 */

// Generate a simple encryption key from the domain
const getEncryptionKey = (): string => {
  const domain = typeof window !== "undefined" ? window.location.hostname : "terturions";
  let key = 0;
  for (let i = 0; i < domain.length; i++) {
    key += domain.charCodeAt(i);
  }
  return key.toString(16);
};

// Encrypt text using XOR operation with the key
export const encrypt = (text: string): string => {
  if (!text) return "";

  const key = getEncryptionKey();
  let result = "";

  for (let i = 0; i < text.length; i++) {
    const charCode = text.charCodeAt(i) ^ key.charCodeAt(i % key.length);
    result += String.fromCharCode(charCode);
  }

  return btoa(result); // Base64 encode for safe storage
};

// Decrypt text using XOR operation with the key
export const decrypt = (encryptedText: string): string => {
  if (!encryptedText) return "";

  try {
    const key = getEncryptionKey();
    const text = atob(encryptedText); // Base64 decode
    let result = "";

    for (let i = 0; i < text.length; i++) {
      const charCode = text.charCodeAt(i) ^ key.charCodeAt(i % key.length);
      result += String.fromCharCode(charCode);
    }

    return result;
  } catch (error) {
    console.error("Error decrypting text:", error);
    return "";
  }
};
