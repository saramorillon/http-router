import type { IncomingMessage, ServerResponse } from 'node:http'

export function mockReq(req: Partial<IncomingMessage> = {}): IncomingMessage {
  return {
    method: 'GET',
    url: '/',
    headers: { host: 'localhost' },
    socket: {},
    ...req,
  } as IncomingMessage
}

export function mockRes(res: Partial<ServerResponse> = {}): ServerResponse {
  return {
    end: vi.fn(),
    ...res,
  } as never
}
