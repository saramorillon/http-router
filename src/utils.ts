import { readFile } from 'node:fs/promises'
import type { IncomingMessage, ServerResponse } from 'node:http'
import { resolve } from 'node:path'
import type { Readable } from 'node:stream'
import mime from 'mime/lite'

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

export function sendHtml(this: ServerResponse, html: string) {
  if (!this.hasHeader('content-type')) {
    this.setHeader('content-type', 'text/html')
  }
  this.end(html)
}

export function redirect(this: ServerResponse, location: string, statusCode = 301) {
  this.setHeader('location', location)
  this.statusCode = statusCode
  this.end()
}

export function serveStatic(root = 'public') {
  return async (req: IncomingMessage, res: ServerResponse) => {
    const filePath = resolve(root, req.url?.replace('/', '') || 'index.html')
    try {
      const content = await readFile(filePath, 'utf8')
      res.setHeader('content-type', mime.getType(filePath) || 'application/octet-stream')
      res.end(content)
    } catch {
      res.statusCode = 404
      res.end()
    }
  }
}
