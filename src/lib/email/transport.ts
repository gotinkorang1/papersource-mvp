export type MockEmail = {
  idempotencyKey: string;
  event: string;
  entityId: string;
  to: string;
  subject: string;
  html: string;
  text: string;
};

const inbox: MockEmail[] = [];
const sentKeys = new Set<string>();

export function resetMockInbox() {
  inbox.length = 0;
  sentKeys.clear();
}

export function listMockInbox() {
  return [...inbox];
}

export function hasSentKey(key: string) {
  return sentKeys.has(key);
}

export function markSent(message: MockEmail) {
  sentKeys.add(message.idempotencyKey);
  inbox.push(message);
}
