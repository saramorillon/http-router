import { Router } from '../src/router.js'
import { mockReq, mockRes } from './mocks.js'

describe('use', () => {
  it('should add listener to routes', () => {
    const listener = vi.fn()

    const router = new Router()
    router.use(listener)

    expect(router['_routes']).toEqual([listener])
  })
})

describe('get', () => {
  it('should add listener to routes', () => {
    const listener = vi.fn()

    const router = new Router()
    router.get('/', listener)

    expect(router['_routes']).toEqual([{ method: 'get', path: '/', listeners: [listener] }])
  })
})

describe('post', () => {
  it('should add listener to routes', () => {
    const listener = vi.fn()

    const router = new Router()
    router.post('/', listener)

    expect(router['_routes']).toEqual([{ method: 'post', path: '/', listeners: [listener] }])
  })
})

describe('put', () => {
  it('should add listener to routes', () => {
    const listener = vi.fn()

    const router = new Router()
    router.put('/', listener)

    expect(router['_routes']).toEqual([{ method: 'put', path: '/', listeners: [listener] }])
  })
})

describe('patch', () => {
  it('should add listener to routes', () => {
    const listener = vi.fn()

    const router = new Router()
    router.patch('/', listener)

    expect(router['_routes']).toEqual([{ method: 'patch', path: '/', listeners: [listener] }])
  })
})

describe('delete', () => {
  it('should add listener to routes', () => {
    const listener = vi.fn()

    const router = new Router()
    router.delete('/', listener)

    expect(router['_routes']).toEqual([{ method: 'delete', path: '/', listeners: [listener] }])
  })
})

describe('listen', () => {
  it('should add res helpers', async () => {
    const req = mockReq({ method: undefined })
    const res = mockRes()

    const router = new Router()
    await router.listen(req, res)

    expect(res.json).toEqual(expect.any(Function))
    expect(res.text).toEqual(expect.any(Function))
    expect(res.redirect).toEqual(expect.any(Function))
  })

  it('should return 404 error if method is not defined', async () => {
    const req = mockReq({ method: undefined })
    const res = mockRes()

    const router = new Router()
    await router.listen(req, res)

    expect(res.statusCode).toBe(404)
    expect(res.end).toHaveBeenCalled()
  })

  it('should return 404 error if url is not defined', async () => {
    const req = mockReq({ url: undefined })
    const res = mockRes()

    const router = new Router()
    await router.listen(req, res)

    expect(res.statusCode).toBe(404)
    expect(res.end).toHaveBeenCalled()
  })

  it('should return 404 error if host is not defined', async () => {
    const req = mockReq({ headers: {} })
    const res = mockRes()

    const router = new Router()
    await router.listen(req, res)

    expect(res.statusCode).toBe(404)
    expect(res.end).toHaveBeenCalled()
  })

  it('should add req.body helpers', async () => {
    const req = mockReq({ headers: { host: 'localhost' } })
    const res = mockRes()

    const router = new Router()
    await router.listen(req, res)

    expect(req.body.raw).toEqual(expect.any(Function))
    expect(req.body.text).toEqual(expect.any(Function))
    expect(req.body.json).toEqual(expect.any(Function))
    expect(req.body.encoded).toEqual(expect.any(Function))
  })

  it('should set request protocol with "x-forwarded-proto" header', async () => {
    const req = mockReq({ headers: { host: 'localhost', 'x-forwarded-proto': 'http' } })
    const res = mockRes()

    const router = new Router()
    await router.listen(req, res)

    expect(req.protocol).toBe('http')
  })

  it('should set request protocol with "x-forwarded-proto" header as https', async () => {
    const req = mockReq({ headers: { host: 'localhost', 'x-forwarded-proto': 'https' } })
    const res = mockRes()

    const router = new Router()
    await router.listen(req, res)

    expect(req.protocol).toBe('https')
  })

  it('should set request protocol without "x-forwarded-proto" header and without encryption', async () => {
    const req = mockReq()
    const res = mockRes()

    const router = new Router()
    await router.listen(req, res)

    expect(req.protocol).toBe('http')
  })

  it('should set request protocol without "x-forwarded-proto" header and with encryption', async () => {
    const req = mockReq({ socket: { encrypted: true } as never })
    const res = mockRes()

    const router = new Router()
    await router.listen(req, res)

    expect(req.protocol).toBe('https')
  })

  it('should set request method to lower case', async () => {
    const req = mockReq()
    const res = mockRes()

    const router = new Router()
    await router.listen(req, res)

    expect(req.method).toBe('get')
  })

  it('should set request base URL', async () => {
    const req = mockReq()
    const res = mockRes()

    const router = new Router()
    await router.listen(req, res)

    expect(req.baseUrl).toBe('http://localhost')
  })

  it('should set request query params', async () => {
    const req = mockReq({ url: '/test?param=value' })
    const res = mockRes()

    const router = new Router()
    await router.listen(req, res)

    expect(req.query).toEqual(new URLSearchParams({ param: 'value' }))
  })

  it('should init request params', async () => {
    const req = mockReq()
    const res = mockRes()

    const router = new Router()
    await router.listen(req, res)

    expect(req.params).toEqual({})
  })

  it('should call first matching route', async () => {
    const req = mockReq()
    const res = mockRes()

    const listener1 = vi.fn()
    const listener2 = vi.fn()
    const listener3 = vi.fn()

    const router = new Router()
    router.post('/', listener1)
    router.get('/', listener2)
    router.get('/', listener3)
    await router.listen(req, res)

    expect(listener1).not.toHaveBeenCalled()
    expect(listener2).toHaveBeenCalledWith(req, res)
    expect(listener3).not.toHaveBeenCalled()
  })

  it('should not call matching route without params', async () => {
    const req = mockReq()
    const res = mockRes()

    const listener = vi.fn()

    const router = new Router()
    router.get('/:path', listener)
    await router.listen(req, res)

    expect(listener).not.toHaveBeenCalled()
  })

  it('should call matching route with params', async () => {
    const req = mockReq({ url: '/test' })
    const res = mockRes()

    const listener = vi.fn()

    const router = new Router()
    router.get('/:path', listener)
    await router.listen(req, res)

    expect(listener).toHaveBeenCalledWith(req, res)
  })

  it('should set request params', async () => {
    const req = mockReq({ url: '/test' })
    const res = mockRes()

    const router = new Router()
    router.get('/:path', vi.fn())
    await router.listen(req, res)

    expect(req.params).toEqual({ path: 'test' })
  })

  it('should call all middlewares before route', async () => {
    const req = mockReq()
    const res = mockRes()

    const listener1 = vi.fn()
    const listener2 = vi.fn()

    const router = new Router()
    router.use(listener1)
    router.get('/', listener2)
    await router.listen(req, res)

    expect(listener1).toHaveBeenCalledWith(req, res)
    expect(listener2).toHaveBeenCalledWith(req, res)
  })

  it('should not call middlewares after route', async () => {
    const req = mockReq()
    const res = mockRes()

    const listener1 = vi.fn()
    const listener2 = vi.fn()

    const router = new Router()
    router.get('/', listener1)
    router.use(listener2)
    await router.listen(req, res)

    expect(listener1).toHaveBeenCalledWith(req, res)
    expect(listener2).not.toHaveBeenCalled()
  })

  it('should call catch all route', async () => {
    const req = mockReq()
    const res = mockRes()

    const listener = vi.fn()

    const router = new Router()
    router.get('*', listener)
    await router.listen(req, res)

    expect(listener).toHaveBeenCalledWith(req, res)
  })

  it('should return 404 error if route does not exist', async () => {
    const req = mockReq()
    const res = mockRes()

    const router = new Router()
    await router.listen(req, res)

    expect(res.statusCode).toBe(404)
    expect(res.end).toHaveBeenCalled()
  })
})

describe('matchRoute', () => {
  it('should return undefined if routes have different lengths', () => {
    const router = new Router()
    expect(router['matchRoute']('', '/')).toBeUndefined()
  })

  it('should return undefined if routes do not match', () => {
    const router = new Router()
    expect(router['matchRoute']('/1', '/2')).toBeUndefined()
  })

  it('should return undefined if routes match without params', () => {
    const router = new Router()
    expect(router['matchRoute']('/:id', '/')).toBeUndefined()
  })

  it('should return empty params if route match without params', () => {
    const router = new Router()
    expect(router['matchRoute']('/1', '/1')).toEqual({})
  })

  it('should return params', () => {
    const router = new Router()
    expect(router['matchRoute']('/:id', '/1')).toEqual({ id: '1' })
  })
})
