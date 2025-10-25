import 'node:http'

declare module 'node:http' {
  interface IncomingMessage {
    protocol: 'http' | 'https'
    baseUrl: string
    params: Record<string, string>
    query: URLSearchParams
    body: {
      raw: () => Promise<Buffer>
      text: () => Promise<string>
      json: () => Promise<unknown>
      encoded: () => Promise<unknown>
    }
  }

  interface ServerResponse {
    json: (obj: unknown) => void
    text: (text: string) => void
    redirect: (location: string, status?: number) => void
  }
}

export * from './models.js'
export * from './router.js'
export * from './utils.js'
