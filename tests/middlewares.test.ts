import type { IncomingMessage } from 'node:http'
import { PassThrough } from 'node:stream'
import { parseJsonBody, parseUrlEncodedBody } from '../src/middlewares.js'

describe('parseJsonBody', () => {
  it('should return JSON parsed data', async () => {
    const stream = new PassThrough()
    stream.write('{')
    stream.write('"toto":')
    stream.write('"titi')
    stream.write('"')
    stream.write('}')
    stream.end()
    const req = stream as unknown as IncomingMessage
    await parseJsonBody(req)
    expect(req.body).toEqual({ toto: 'titi' })
  })
})

describe('parseJsonBody', () => {
  it('should return URL encoded parsed data', async () => {
    const stream = new PassThrough()
    stream.write('to')
    stream.write('to=')
    stream.write('ti')
    stream.write('t')
    stream.write('i')
    stream.end()
    const req = stream as unknown as IncomingMessage
    await parseUrlEncodedBody(req)
    expect(req.body).toEqual({ toto: 'titi' })
  })
})
