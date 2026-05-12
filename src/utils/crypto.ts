const PBKDF2_ITERATIONS = 100000; 

export const timingSafeEqual = (a: string, b: string): boolean => {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
};

export const hashPassword = async (password: string): Promise<string> => {
  const encoder = new TextEncoder();
  const salt = crypto.getRandomValues(new Uint8Array(16));
  
  const keyMaterial = await crypto.subtle.importKey(
    "raw", encoder.encode(password), { name: "PBKDF2" }, false, ["deriveBits"]
  );
  
  const hash = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt: salt, iterations: PBKDF2_ITERATIONS, hash: "SHA-256" },
    keyMaterial,
    256 // 32 bytes
  );
  
  const saltHex = Array.from(salt).map(b => b.toString(16).padStart(2, '0')).join('');
  const hashHex = Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
  
  return `${saltHex}:${hashHex}`;
};

export const verifyPassword = async (password: string, storedHash: string): Promise<boolean> => {
  const parts = storedHash.split(':');
  if (parts.length !== 2) return false;
  
  const [saltHex, key] = parts;
  const saltMatch = saltHex.match(/.{1,2}/g);
  if (!saltMatch) return false;
  
  const salt = new Uint8Array(saltMatch.map(byte => parseInt(byte, 16)));
  const encoder = new TextEncoder();
  
  try {
    const keyMaterial = await crypto.subtle.importKey(
      "raw", encoder.encode(password), { name: "PBKDF2" }, false, ["deriveBits"]
    );
    
    const hash = await crypto.subtle.deriveBits(
      { name: "PBKDF2", salt: salt, iterations: PBKDF2_ITERATIONS, hash: "SHA-256" },
      keyMaterial,
      256
    );
    
    const hashHex = Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
    return timingSafeEqual(hashHex, key);
  } catch (e) {
    return false;
  }
};
