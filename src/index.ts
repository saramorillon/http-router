import 'node:http'

declare module 'node:http' {
  interface IncomingMessage {
    protocol: 'http' | 'https'
    baseUrl: string
    params: Record<string, string>
  }
}

export * from './helpers.js'
export * from './models.js'
export * from './router.js'
