import { cookies } from "next/headers";

export const SESSION_COOKIE = "gmp_pid";

export async function getParticipantIdFromCookies(): Promise<string | null> {
  const store = await cookies();
  return store.get(SESSION_COOKIE)?.value ?? null;
}

export async function setParticipantCookie(participantId: string): Promise<void> {
  const store = await cookies();
  store.set(SESSION_COOKIE, participantId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 3, // 3 days, plenty for a 15-20 min task with resume tolerance
  });
}
