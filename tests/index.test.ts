import type { IncomingMessage, ServerResponse } from 'node:http'
import { Router } from '../src/index.js'

describe('use', () => {
  it('should add listener to routes', () => {
    const listener = vi.fn()

    const router = new Router('http')
    router.use(listener)

    expect(router['_routes']).toEqual([listener])
  })
})

describe('get', () => {
  it('should add listener to routes', () => {
    const listener = vi.fn()

    const router = new Router('http')
    router.get('/', listener)

    expect(router['_routes']).toEqual([{ method: 'get', path: '/', listeners: [listener] }])
  })
})

describe('post', () => {
  it('should add listener to routes', () => {
    const listener = vi.fn()

    const router = new Router('http')
    router.post('/', listener)

    expect(router['_routes']).toEqual([{ method: 'post', path: '/', listeners: [listener] }])
  })
})

describe('put', () => {
  it('should add listener to routes', () => {
    const listener = vi.fn()

    const router = new Router('http')
    router.put('/', listener)

    expect(router['_routes']).toEqual([{ method: 'put', path: '/', listeners: [listener] }])
  })
})

describe('patch', () => {
  it('should add listener to routes', () => {
    const listener = vi.fn()

    const router = new Router('http')
    router.patch('/', listener)

    expect(router['_routes']).toEqual([{ method: 'patch', path: '/', listeners: [listener] }])
  })
})

describe('delete', () => {
  it('should add listener to routes', () => {
    const listener = vi.fn()

    const router = new Router('http')
    router.delete('/', listener)

    expect(router['_routes']).toEqual([{ method: 'delete', path: '/', listeners: [listener] }])
  })
})

describe('listen', () => {
  it('should return 404 error if method is not defined', async () => {
    const req = {} as unknown as IncomingMessage
    const res = { end: vi.fn() } as unknown as ServerResponse

    const router = new Router('http')
    await router.listen(req, res)

    expect(res.statusCode).toBe(404)
    expect(res.end).toHaveBeenCalled()
  })

  it('should return 404 error if url is not defined', async () => {
    const req = { method: 'GET' } as unknown as IncomingMessage
    const res = { end: vi.fn() } as unknown as ServerResponse

    const router = new Router('http')
    await router.listen(req, res)

    expect(res.statusCode).toBe(404)
    expect(res.end).toHaveBeenCalled()
  })

  it('should return 404 error if host is not defined', async () => {
    const req = { method: 'GET', url: '/', headers: {} } as unknown as IncomingMessage
    const res = { end: vi.fn() } as unknown as ServerResponse

    const router = new Router('http')
    await router.listen(req, res)

    expect(res.statusCode).toBe(404)
    expect(res.end).toHaveBeenCalled()
  })

  it('should call first matching route', async () => {
    const req = { method: 'GET', url: '/', headers: { host: 'localhost' } } as unknown as IncomingMessage
    const res = { end: vi.fn() } as unknown as ServerResponse

    const listener1 = vi.fn()
    const listener2 = vi.fn()
    const listener3 = vi.fn()

    const router = new Router('http')
    router.post('/', listener1)
    router.get('/', listener2)
    router.get('/', listener3)
    await router.listen(req, res)

    expect(listener1).not.toHaveBeenCalled()
    expect(listener2).toHaveBeenCalledWith(req, res)
    expect(listener3).not.toHaveBeenCalled()
  })

  it('should call matching route with params', async () => {
    const req = { method: 'GET', url: '/test', headers: { host: 'localhost' } } as unknown as IncomingMessage
    const res = { end: vi.fn() } as unknown as ServerResponse

    const listener = vi.fn()

    const router = new Router('http')
    router.get('/:path', listener)
    await router.listen(req, res)

    expect(listener).toHaveBeenCalledWith(req, res)
  })

  it('should call all middlewares before route', async () => {
    const req = { method: 'GET', url: '/', headers: { host: 'localhost' } } as unknown as IncomingMessage
    const res = { end: vi.fn() } as unknown as ServerResponse

    const listener1 = vi.fn()
    const listener2 = vi.fn()

    const router = new Router('http')
    router.use(listener1)
    router.get('/', listener2)
    await router.listen(req, res)

    expect(listener1).toHaveBeenCalledWith(req, res)
    expect(listener2).toHaveBeenCalledWith(req, res)
  })

  it('should not call all middlewares after route', async () => {
    const req = { method: 'GET', url: '/', headers: { host: 'localhost' } } as unknown as IncomingMessage
    const res = { end: vi.fn() } as unknown as ServerResponse

    const listener1 = vi.fn()
    const listener2 = vi.fn()

    const router = new Router('http')
    router.get('/', listener1)
    router.use(listener2)
    await router.listen(req, res)

    expect(listener1).toHaveBeenCalledWith(req, res)
    expect(listener2).not.toHaveBeenCalled()
  })

  it('should call catch all route', async () => {
    const req = { method: 'GET', url: '/', headers: { host: 'localhost' } } as unknown as IncomingMessage
    const res = { end: vi.fn() } as unknown as ServerResponse

    const listener = vi.fn()

    const router = new Router('http')
    router.get('*', listener)
    await router.listen(req, res)

    expect(listener).toHaveBeenCalledWith(req, res)
  })

  it('should return 404 error if route does not exist', async () => {
    const req = { method: 'GET', url: '/', headers: { host: 'localhost' } } as unknown as IncomingMessage
    const res = { end: vi.fn() } as unknown as ServerResponse

    const router = new Router('http')
    await router.listen(req, res)

    expect(res.statusCode).toBe(404)
    expect(res.end).toHaveBeenCalled()
  })
})

describe('matchRoute', () => {
  it('should return undefined if routes have different lengths', () => {
    const router = new Router('http')
    expect(router['matchRoute']('', '/')).toBeUndefined()
  })

  it('should return undefined if routes do not match', () => {
    const router = new Router('http')
    expect(router['matchRoute']('/1', '/2')).toBeUndefined()
  })

  it('should return empty params if route match without params', () => {
    const router = new Router('http')
    expect(router['matchRoute']('/1', '/1')).toEqual({})
  })

  it('should return params', () => {
    const router = new Router('http')
    expect(router['matchRoute']('/:id', '/1')).toEqual({ id: '1' })
  })
})
