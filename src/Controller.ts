import { merge, find } from 'lodash';
import * as Debug from 'debug';
import { ResponseToolkit, RouteOptions } from 'hapi';
import { badRequest } from 'boom';
import { SchemaLike } from 'joi';
const debug = Debug('hapiDecorators');
enum RouteMethods {
  Get = 'get',
  Post = 'post',
  Put = 'put',
  Del = 'delete',
  Patch = 'patch',
  All = '*'
}

const routeSettingMetadata = Symbol('routeSetting');
const routeInfo = new WeakMap();

const routeConfig: any[] = [];

export interface ValidationOptions {
  errorFields?: string[];
  failAction?: (request: Request, h: ResponseToolkit, err: any) => void;
  headers?: SchemaLike | SchemaLike[];
  params?: SchemaLike | SchemaLike[];
  query?: SchemaLike | SchemaLike[];
  payload?: SchemaLike | SchemaLike[];
  options?: SchemaLike | SchemaLike[];
}
export interface Validation {
  validate: ValidationOptions;
  tags?: string[];
  description?: string;
  auth?: string;
}
export type RouteMethod = 'get' | 'post' | 'put' | 'delete' | 'patch' | '*';

function metaData(target: any, data?: any) {
  const isSet = arguments.length === 2;
  const constructor = target.constructor;
  const metadata = routeInfo.get(constructor);
  if (!metadata) {
    routeInfo.set(constructor, {});
  }
  if (isSet) {
    routeInfo.set(constructor, merge(metadata || {}, data));
    return;
  }
  return metadata || {};
}

export class Api {
  constructor() {
    (this as any)[routeSettingMetadata]();
  }
}

export function Controller(baseUrl: string) {
  return function HapiModule<T extends { new (...args: any[]): {} }>(
    constructor: T
  ) {
    const metadata: any = routeInfo.get(constructor) || {};
    metadata.baseUrl = baseUrl;
    constructor.prototype[routeSettingMetadata] = function() {
      routeConfig.push(...getRoutes(this));
    };
    return constructor;
  };
}

function getRoutes(target: any) {
  const hapiSetting = metaData(target);
  const base = trimslash(hapiSetting.baseUrl);

  debug('Pre-trim baseUrl: %s', hapiSetting.baseUrl);
  debug('Post-trim baseUrl: %s', base);

  if (!hapiSetting.rawRoutes) {
    return [];
  }

  return hapiSetting.rawRoutes.map((route: any) => {
    if (!('path' in route)) {
      throw new Error('Route path must be set with `@Route` or another alias');
    }

    debug('Route path before merge with baseUrl: %s', route.path);
    const url = base + trimslash(route.path) || '/';
    const hapiRoute = merge({}, route);
    hapiRoute.path = url;
    hapiRoute.options.bind = target;
    return hapiRoute;
  });
}

export function Route(method: RouteMethod, path: string) {
  debug('@route (or alias) setup');
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    const targetName = target.constructor.name;
    const routeId = targetName + '.' + propertyKey;

    setRoute(target, propertyKey, {
      method,
      path,
      options: {
        id: routeId
      },
      handler: descriptor.value
    });

    return descriptor;
  };
}

/**
 * add configuration to a route
 * @param options
 */
export function Config(options: RouteOptions) {
  debug('@options setup');
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    setRoute(target, propertyKey, {
      options
    });
    return descriptor;
  };
}

/**
 * add validator to a route
 * @param validateConfig
 */
export function Validate(validateConfig: Validation) {
  debug('@validate setup');
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    const finalConfig: any = {
      options: {
        validate: {
          failAction: async (
            request: Request,
            h: ResponseToolkit,
            err: any
          ) => {
            if (process.env.NODE_ENV === 'production') {
              // In prod, log a limited error message and throw the default Bad Request error.
              console.error('ValidationError:', err.message); // Better to use an actual logger here.
              throw badRequest(`Invalid request payload input`);
            } else {
              // During development, log and respond with the full error.
              console.error(err);
              throw err;
            }
          },
          ...validateConfig.validate
        }
      }
    };
    ['tags', 'description', 'auth'].forEach(key => {
      const value = (<any>validateConfig)[key];
      if (value) {
        finalConfig.options[key] = value;
      }
    });
    setRoute(target, propertyKey, finalConfig);
    return descriptor;
  };
}

/**
 * add cache setting to a route
 * @param cacheConfig
 */
export function Cache(cacheConfig: any) {
  debug('@cache setup');
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    setRoute(target, propertyKey, {
      options: {
        cache: cacheConfig
      }
    });

    return descriptor;
  };
}

/**
 * add Pre setting to a route
 * @param pre
 */
export function Pre(pre: string | any) {
  debug('@pre setup');
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    const hapiSetting = metaData(target);
    if (typeof pre === 'string') {
      pre = [{ method: hapiSetting.middleware[pre] }];
    } else if (!Array.isArray(pre)) {
      pre = [pre];
    }
    setRoute(target, propertyKey, {
      options: {
        pre
      }
    });

    return descriptor;
  };
}

/**
 * set a function as a middleware,
 * and to be used in @Pre
 */
export function Middleware() {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    const hapiSetting = metaData(target);
    if (!hapiSetting.middleware) {
      hapiSetting.middleware = {};
    }

    hapiSetting.middleware[propertyKey] = descriptor.value;

    return descriptor;
  };
}

function setRoute(target: any, propertyKey: string, value: any) {
  const hapiSetting = metaData(target);
  if (!hapiSetting.rawRoutes) {
    hapiSetting.rawRoutes = [];
  }

  const targetName = target.constructor.name;
  const routeId = targetName + '.' + propertyKey;
  const defaultRoute = {
    options: {
      id: routeId
    }
  };
  const found = find(hapiSetting.rawRoutes, item => {
    return item.options.id === routeId;
  });

  if (found) {
    debug('Subsequent configuration of route object for: %s', routeId);
    merge(found, value);
  } else {
    debug('Initial setup of route object for: %s', routeId);
    hapiSetting.rawRoutes.push(merge(defaultRoute, value));
  }
  metaData(target, hapiSetting);
}

function trimslash(s: string) {
  return s[s.length - 1] === '/' ? s.slice(0, s.length - 1) : s;
}

export const Get = (apiPath: string) => Route(RouteMethods.Get, apiPath);
export const Post = (apiPath: string) => Route(RouteMethods.Post, apiPath);
export const Put = (apiPath: string) => Route(RouteMethods.Put, apiPath);
export const Del = (apiPath: string) => Route(RouteMethods.Del, apiPath);
export const Patch = (apiPath: string) => Route(RouteMethods.Patch, apiPath);
export const All = (apiPath: string) => Route(RouteMethods.All, apiPath);

export function routeSettings() {
  return routeConfig;
}
