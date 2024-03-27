import type { IncomingMessage } from 'node:http'

export async function parseJsonBody(req: IncomingMessage) {
  req.body = await new Promise<Record<string, unknown>>((resolve) => {
    const data: Buffer[] = []

    req.on('data', (chunk) => {
      data.push(chunk)
    })

    req.on('end', () => {
      resolve(JSON.parse(Buffer.concat(data).toString()))
    })
  })
}

export async function parseUrlEncodedBody(req: IncomingMessage) {
  req.body = await new Promise<Record<string, unknown>>((resolve) => {
    const data: Buffer[] = []

    req.on('data', (chunk) => {
      data.push(chunk)
    })

    req.on('end', () => {
      resolve(Object.fromEntries(new URLSearchParams(Buffer.concat(data).toString()).entries()))
    })
  })
}
