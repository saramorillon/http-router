import 'node:http'

declare module 'node:http' {
  interface IncomingMessage {
    protocol: 'http' | 'https'
    baseUrl: string
    params: Record<string, string>
    body: Record<string, unknown>
  }
}
