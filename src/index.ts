import 'reflect-metadata';
import { merge, find } from 'lodash';
import * as Debug from 'debug';
const debug = Debug('hapiDecorators');
const hapiMetadataKey = Symbol('hapi');
enum RouteMethods {
  Get = 'get',
  Post = 'post',
  Put = 'put',
  Del = 'delete',
  Patch = 'patch',
  All = '*'
}

export type RouteMethod = 'get' | 'post' | 'put' | 'delete' | 'patch' | '*';

export function Module(baseUrl: string) {
  return function HapiModule<T extends { new (...args: any[]): {} }>(
    constructor: T
  ) {
    return class extends constructor {
      [hapiMetadataKey] = {
        baseUrl
      };
      routeSetting() {
        return getRoutes(this);
      }
    };
  };
}

function getRoutes(target: any) {
  const hapiSetting = target[hapiMetadataKey];
  const base = trimslash(hapiSetting.baseUrl);

  debug('Pre-trim baseUrl: %s', hapiSetting.baseUrl);
  debug('Post-trim baseUrl: %s', base);

  if (!hapiSetting.rawRoutes) {
    return [];
  }

  return hapiSetting.rawRoutes.map(function(route) {
    if (!('path' in route)) {
      throw new Error('Route path must be set with `@Route` or another alias');
    }

    debug('Route path before merge with baseUrl: %s', route.path);
    const url = base + trimslash(route.path) || '/';
    const hapiRoute = merge({}, route);
    hapiRoute.path = url;
    hapiRoute.config.bind = target;
    return hapiRoute;
  });
}

export function Route(method: RouteMethod, path: string) {
  debug('@route (or alias) setup');
  return function(
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const targetName = target.constructor.name;
    const routeId = targetName + '.' + propertyKey;

    setRoute(target, propertyKey, {
      method: method,
      path: path,
      config: {
        id: routeId
      },
      handler: descriptor.value
    });

    return descriptor;
  };
}

/**
 * add configuration to a route
 * @param config
 */
export function Config(config) {
  debug('@config setup');
  return function(
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    setRoute(target, propertyKey, {
      config: config
    });
    return descriptor;
  };
}

/**
 * add validator to a route
 * @param validateConfig
 */
export function Validate(validateConfig: any) {
  debug('@validate setup');
  return function(
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    setRoute(target, propertyKey, {
      config: {
        validate: validateConfig
      }
    });

    return descriptor;
  };
}

/**
 * add cache setting to a route
 * @param cacheConfig
 */
export function Cache(cacheConfig: any) {
  debug('@cache setup');
  return function(
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    setRoute(target, propertyKey, {
      config: {
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
  return function(
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const hapiSetting = target[hapiMetadataKey];
    if (typeof pre === 'string') {
      pre = [{ method: hapiSetting.middleware[pre] }];
    } else if (!Array.isArray(pre)) {
      pre = [pre];
    }
    setRoute(target, propertyKey, {
      config: {
        pre: pre
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
  return function(
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const hapiSetting = target[hapiMetadataKey];
    if (!hapiSetting.middleware) {
      hapiSetting.middleware = {};
    }

    hapiSetting.middleware[propertyKey] = descriptor.value;

    return descriptor;
  };
}

function setRoute(target: any, propertyKey: string, value: any) {
  const hapiSetting = target[hapiMetadataKey];
  if (!hapiSetting.rawRoutes) {
    hapiSetting.rawRoutes = [];
  }

  const targetName = target.constructor.name;
  const routeId = targetName + '.' + propertyKey;
  const defaultRoute = {
    config: {
      id: routeId
    }
  };
  const found = find(hapiSetting.rawRoutes, 'config.id', routeId);

  if (found) {
    debug('Subsequent configuration of route object for: %s', routeId);
    merge(found, value);
  } else {
    debug('Initial setup of route object for: %s', routeId);
    hapiSetting.rawRoutes.push(merge(defaultRoute, value));
  }
}

function trimslash(s) {
  return s[s.length - 1] === '/' ? s.slice(0, s.length - 1) : s;
}

export const Get = Route.bind(null, RouteMethods.Get);
export const Post = Route.bind(null, RouteMethods.Post);
export const Put = Route.bind(null, RouteMethods.Put);
export const Del = Route.bind(null, RouteMethods.Del);
export const Patch = Route.bind(null, RouteMethods.Patch);
export const All = Route.bind(null, RouteMethods.All);
