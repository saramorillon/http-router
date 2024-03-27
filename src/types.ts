import 'node:http'

declare module 'node:http' {
  interface IncomingMessage {
    baseUrl: string
    params: Record<string, string>
    body: Record<string, unknown>
  }
}
