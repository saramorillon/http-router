import { PassThrough } from 'node:stream'
import { getBody, getJsonBody, getStringBody, getUrlEncodedBody } from '../src/helpers.js'

describe('getBody', () => {
  it('should return body as buffer', async () => {
    const stream = new PassThrough()
    stream.write('toto')
    stream.end()

    const result = await getBody(stream)
    expect(result).toEqual(Buffer.from('toto'))
  })
})

describe('getStringBody', () => {
  it('should return body as string', async () => {
    const stream = new PassThrough()
    stream.write('toto')
    stream.end()

    const result = await getStringBody(stream)
    expect(result).toBe('toto')
  })
})

describe('getJsonBody', () => {
  it('should return JSON body', async () => {
    const stream = new PassThrough()
    stream.write('{')
    stream.write('"toto":')
    stream.write('"titi')
    stream.write('"')
    stream.write('}')
    stream.end()

    const result = await getJsonBody(stream)
    expect(result).toEqual({ toto: 'titi' })
  })
})

describe('getUrlEncodedBody', () => {
  it('should return URL encoded body', async () => {
    const stream = new PassThrough()
    stream.write('to')
    stream.write('to=')
    stream.write('ti')
    stream.write('t')
    stream.write('i')
    stream.end()

    const result = await getUrlEncodedBody(stream)
    expect(result).toEqual({ toto: 'titi' })
  })
})
