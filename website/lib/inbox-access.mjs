const ownerEmailHash = "b44e1ec9bf26cb80266b50948880779ac39ee82fa54f4c5620fff6422d21f7a0";
export async function isOwnerIdentity(id, email) {
  if (!id || typeof email !== "string") return false;
  const bytes = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(email.trim().toLowerCase()));
  const hash = Array.from(new Uint8Array(bytes), byte => byte.toString(16).padStart(2, "0")).join("");
  return hash === ownerEmailHash;
}
