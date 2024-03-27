import type { IncomingMessage, ServerResponse } from 'node:http'

export type RouteListener = (req: IncomingMessage, res: ServerResponse) => Promise<void> | void
