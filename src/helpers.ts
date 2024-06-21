import type { Readable } from 'node:stream'

export function getBody(stream: Readable) {
  return new Promise<Buffer>((resolve) => {
    const data: Buffer[] = []

    stream.on('data', (chunk) => {
      data.push(chunk)
    })

    stream.on('end', () => {
      resolve(Buffer.concat(data))
    })
  })
}

export async function getStringBody(stream: Readable) {
  const body = await getBody(stream)
  return body.toString()
}

export async function getJsonBody(stream: Readable) {
  const body = await getStringBody(stream)
  return JSON.parse(body)
}

export async function getUrlEncodedBody(stream: Readable) {
  const body = await getStringBody(stream)
  return Object.fromEntries(new URLSearchParams(body).entries())
}
