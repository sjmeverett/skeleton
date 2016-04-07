
import InMemoryResourceHandler from './InMemoryResourceHandler.js';
import Joi from 'joi';
import Serene from 'serene';
import SereneResources, {Dispatcher} from 'serene-resources';
import winston from 'winston';
import {BadRequestError} from 'http-status-errors';
import {QueryStringParser} from 'super-api-js';

export const service = new Serene();

// load resource descriptions
export const resources = new SereneResources().load({
  dirname: __dirname,
  filter: /(.+)Resource\.js$/,
  map: (name) => name.toLowerCase()
});

service.use(resources);

for (let resource in resources.resources) {
  winston.debug('loaded resource ' + resource);
}

// parse the query string as per SuperAPI
service.use(function (request, response) {
  if (request.query) {
    request.query = new QueryStringParser(request.query, {
      defaultPageSize: 100,
      maximumPageSize: 1024,
      defaultPageMethod: 'after'
    });
  }
});

// validate requests with bodies
service.use(function (request, response) {
  if (request.operation.body && request.resource.schema) {
    return new Promise(function (resolve, reject) {
      Joi.validate(request.body, Joi.object({attributes: request.resource.schema.required()}), function (err, value) {
        if (err) {
          reject(new BadRequestError('validation failed', err.details));

        } else {
          request.body = value.attributes;
          resolve();
        }
      });
    });
  }
});

// dispatch requests to resources with registered handlers, but fall back to default if none exists
service.use(new Dispatcher(false));

// default
service.use(new InMemoryResourceHandler());
