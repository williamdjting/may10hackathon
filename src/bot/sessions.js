const sessions = new Map();

export function setSession(telegramId, attendeeId) {
  sessions.set(String(telegramId), String(attendeeId));
}

export function getSession(telegramId) {
  return sessions.get(String(telegramId)) ?? null;
}
