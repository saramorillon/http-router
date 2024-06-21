import type { IncomingMessage, ServerResponse } from 'node:http'
import type { RouteListener } from './models.js'

interface IRoute {
  method: string
  path: string
  listeners: RouteListener[]
}

export class Router {
  private _routes: (IRoute | RouteListener)[] = []

  use(...listeners: RouteListener[]) {
    this._routes.push(...listeners)
    return this
  }

  get(path: string, ...listeners: RouteListener[]) {
    this._routes.push({ method: 'get', path, listeners })
    return this
  }

  post(path: string, ...listeners: RouteListener[]) {
    this._routes.push({ method: 'post', path, listeners })
    return this
  }

  put(path: string, ...listeners: RouteListener[]) {
    this._routes.push({ method: 'put', path, listeners })
    return this
  }

  patch(path: string, ...listeners: RouteListener[]) {
    this._routes.push({ method: 'patch', path, listeners })
    return this
  }

  delete(path: string, ...listeners: RouteListener[]) {
    this._routes.push({ method: 'delete', path, listeners })
    return this
  }

  async listen(req: IncomingMessage, res: ServerResponse) {
    if (!req.method || !req.url || !req.headers.host) {
      res.statusCode = 404
      res.end()
      return
    }

    if (req.headers['x-forwarded-proto'] === 'http' || req.headers['x-forwarded-proto'] === 'https') {
      req.protocol = req.headers['x-forwarded-proto']
    } else if ('encrypted' in req.socket) {
      req.protocol = 'https'
    } else {
      req.protocol = 'http'
    }
    req.method = req.method.toLowerCase()
    req.baseUrl = `${req.protocol}://${req.headers.host}`
    req.params = {}

    const { pathname } = new URL(req.url, req.baseUrl)
    for (const route of this._routes) {
      if (typeof route === 'function') {
        await route(req, res)
        continue
      }

      if (req.method !== route.method) {
        continue
      }

      const params = this.matchRoute(route.path, pathname)
      if (params) {
        for (const listener of route.listeners) {
          req.params = params
          await listener(req, res)
        }
        return
      }
    }

    const catchAllRoute = this._routes.find(
      (route): route is IRoute => typeof route !== 'function' && route.method === req.method && route.path === '*',
    )
    if (catchAllRoute) {
      for (const listener of catchAllRoute.listeners) {
        await listener(req, res)
      }
      return
    }

    res.statusCode = 404
    res.end()
  }

  private matchRoute(routePath: string, reqPath: string) {
    const routeParts = routePath.split('/')
    const reqParts = reqPath.split('/')

    if (routeParts.length !== reqParts.length) {
      return
    }

    const params: Record<string, string> = {}

    for (let i = 0; i < routeParts.length; i++) {
      if (routeParts[i].startsWith(':')) {
        if (!reqParts[i]) {
          return
        }

        params[routeParts[i].slice(1)] = reqParts[i]
        continue
      }

      if (routeParts[i] !== reqParts[i]) {
        return
      }
    }

    return params
  }
}
