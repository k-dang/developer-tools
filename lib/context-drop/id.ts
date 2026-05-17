const ID_BYTES = 16;

export const DROP_ID_LENGTH = 22;
export const DROP_ID_PATTERN = /^[A-Za-z0-9_-]{22}$/;

export function generateDropId(): string {
  const bytes = new Uint8Array(ID_BYTES);
  crypto.getRandomValues(bytes);
  return Buffer.from(bytes).toString("base64url");
}
