import { PassThrough } from 'node:stream'
import { getBody, getJsonBody, getStringBody, getUrlEncodedBody, redirect, sendJson, sendText } from '../src/utils.js'
import { mockRes } from './mocks.js'

describe('getBody', () => {
  it('should return body as buffer', async () => {
    const stream = new PassThrough()
    stream.write('toto')
    stream.end()

    const result = await getBody.call(stream)
    expect(result).toEqual(Buffer.from('toto'))
  })
})

describe('getStringBody', () => {
  it('should return body as string', async () => {
    const stream = new PassThrough()
    stream.write('toto')
    stream.end()

    const result = await getStringBody.call(stream)
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

    const result = await getJsonBody.call(stream)
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

    const result = await getUrlEncodedBody.call(stream)
    expect(result).toEqual({ toto: 'titi' })
  })
})

describe('sendJson', () => {
  it('should set content-type header', () => {
    const res = mockRes()
    sendJson.call(res, { prop: 'value' })
    expect(res.setHeader).toHaveBeenCalledWith('content-type', 'application/json')
  })

  it('should no override content-type header', () => {
    const res = mockRes({ hasHeader: vi.fn().mockReturnValue(true) })
    sendJson.call(res, { prop: 'value' })
    expect(res.setHeader).not.toHaveBeenCalled()
  })

  it('should send stringified object', () => {
    const res = mockRes()
    sendJson.call(res, { prop: 'value' })
    expect(res.end).toHaveBeenCalledWith('{"prop":"value"}')
  })
})

describe('sendText', () => {
  it('should set content-type header', () => {
    const res = mockRes()
    sendText.call(res, 'value')
    expect(res.setHeader).toHaveBeenCalledWith('content-type', 'text/plain')
  })

  it('should no override content-type header', () => {
    const res = mockRes({ hasHeader: vi.fn().mockReturnValue(true) })
    sendText.call(res, 'value')
    expect(res.setHeader).not.toHaveBeenCalled()
  })

  it('should send text', () => {
    const res = mockRes()
    sendText.call(res, 'value')
    expect(res.end).toHaveBeenCalledWith('value')
  })
})

describe('redirect', () => {
  it('should set location header', () => {
    const res = mockRes()
    redirect.call(res, 'http://test.com')
    expect(res.setHeader).toHaveBeenCalledWith('location', 'http://test.com')
  })

  it('should use default status code', () => {
    const res = mockRes()
    redirect.call(res, 'http://test.com')
    expect(res.statusCode).toBe(301)
  })

  it('should set status code', () => {
    const res = mockRes()
    redirect.call(res, 'http://test.com', 302)
    expect(res.statusCode).toBe(302)
  })

  it('should end response', () => {
    const res = mockRes()
    redirect.call(res, 'http://test.com')
    expect(res.end).toHaveBeenCalled()
  })
})
