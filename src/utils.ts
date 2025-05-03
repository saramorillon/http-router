import type { ServerResponse } from 'node:http'
import type { Readable } from 'node:stream'

export function getBody(this: Readable) {
  return new Promise<Buffer>((resolve) => {
    const data: Buffer[] = []

    this.on('data', (chunk) => {
      data.push(chunk)
    })

    this.on('end', () => {
      resolve(Buffer.concat(data))
    })
  })
}

export async function getStringBody(this: Readable) {
  const body = await getBody.call(this)
  return body.toString()
}

export async function getJsonBody(this: Readable) {
  const body = await getStringBody.call(this)
  return JSON.parse(body)
}

export async function getUrlEncodedBody(this: Readable) {
  const body = await getStringBody.call(this)
  return Object.fromEntries(new URLSearchParams(body).entries())
}

export function sendJson(this: ServerResponse, obj: unknown) {
  if (!this.hasHeader('content-type')) {
    this.setHeader('content-type', 'application/json')
  }
  this.end(JSON.stringify(obj))
}

export function sendText(this: ServerResponse, text: string) {
  if (!this.hasHeader('content-type')) {
    this.setHeader('content-type', 'text/plain')
  }
  this.end(text)
}

export function redirect(this: ServerResponse, location: string, statusCode = 301) {
  this.setHeader('location', location)
  this.statusCode = statusCode
  this.end()
}
