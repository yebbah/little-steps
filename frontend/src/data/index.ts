// The data layer's public face (AD-5, AD-23): reads through TanStack Query, writes only through the outbox.
export { queryClient } from './queryClient.ts'
export { getJson, ApiError } from './http.ts'
export { outbox, session, startDataLayer, whenReady } from './runtime.ts'
export { useOutboxCommands, PARKED_MESSAGE_KEY, RETRY_LABEL_KEY } from './outbox.ts'
export type { NewCommand } from './outbox.ts'
export type { Command } from './db.ts'
export { useDraft } from './useDraft.ts'
export type { SessionPort, SessionState } from './session.ts'
