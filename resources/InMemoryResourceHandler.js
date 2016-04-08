
import _ from 'lodash';
import shortid from 'shortid';
import winston from 'winston';
import {Resource} from 'super-api-js';
import {config} from '../server.js';
import {NotFoundError, ConflictError} from 'http-status-errors';


export default class InMemoryResourceHandler {
  constructor() {
    this.resources = {tasks: {
      a: {id: 'a', description: 'a'},
      b: {id: 'b', description: 'b'},
      c: {id: 'c', description: 'c'},
      d: {id: 'd', description: 'd'},
      e: {id: 'e', description: 'e'},
      f: {id: 'f', description: 'f'},
      g: {id: 'g', description: 'g'}
    }};
  }

  handle(request, response) {
    if (!this.resources[request.resourceName])
      this.resources[request.resourceName] = {};

    request.data = this.resources[request.resourceName];
    this[request.operation.name](request, response);
  }

  list(request, response) {
    winston.debug(`list ${request.resourceName}`);
    let items = _.values(request.data);
    let sort = request.query.sort();
    let filter = request.query.filter();
    let page = request.query.page();
    let fields = request.query.fields(request.resourceName);

    response.result = new Resource(request.resourceName, config.baseUrl);

    if (sort) {
      let keys = _.keys(sort);
      let dirs = _(sort).values().map((x) => x === 1 ? 'asc' : 'desc').value();
      items = _.orderBy(items, keys, dirs);
    }

    if (filter)
      items = _.filter(items, _.conforms(_.mapValues(filter, (x) => _.partial(_.includes, x))));

    let count = items.length;
    let exists;

    if (page) {
      switch (page.method) {
        case 'number':
          items = items.slice((page.number - 1) * page.size, page.number * page.size);
          break;

        case 'offset':
          items = items.slice(page.offset, page.offset + page.size);
          break;

        case 'after':
          let key = page.field;
          let op = page.direction === 1 ? _.gt : _.lt;

          if (typeof page.after !== 'undefined') {
            let f = {};
            f[key] = _.partial(op, _, page.after);
            let index = _.findIndex(items, _.conforms(f));
            exists = typeof items[index + page.size] !== 'undefined';
            items = items.slice(index, index + page.size);

          } else {
            exists = typeof items[page.size] !== 'undefined';
            items = items.slice(0, page.size);
          }

          if (page.reverse) {
            items = items.reverse();
          }

          break;
      }
    }

    if (fields)
      items = items.map(_.partial(_.pick, _, fields));

    response.result
      .querystring(request.query)
      .elements(items)
      .paging(count, exists);
  }

  get(request, response) {
    winston.debug(`get ${request.resourceName}/${request.id}`);
    let item = request.data[request.id];

    if (!item)
      throw new NotFoundError(`resource ${request.resourceName}/${request.id} not found`);

    let fields = request.query.fields(request.resourceName);

    if (fields)
      item = _.pick(item, fields);

    response.result = new Resource(request.resourceName, config.baseUrl)
      .attributes(item);
  }

  create(request, response) {
    winston.debug(`create ${request.resourceName}`);

    if (request.data[request.body.id])
      throw new ConflictError(`resource ${request.resourceName}/${request.id} already exists`);

    request.body.id = shortid.generate();
    request.data[request.body.id] = request.body;

    response.result = new Resource(request.resourceName, config.baseUrl)
      .attributes(request.body);

    response.headers.Location = response.result.links().$self;
  }

  update(request, response) {
    winston.debug(`update ${request.resourceName}/${request.id}`);

    if (!request.data[request.id])
      throw new NotFoundError(`resource ${request.resourceName}/${request.id} not found`);

    if (request.body.id && request.id !== request.body.id)
      throw new ConflictError(`tried to update resource ${request.resourceName}/${request.id} ID to ${request.body.id}`);

    _.assign(request.data[request.id], request.body);

    response.result = new Resource(request.resourceName, config.baseUrl)
      .attributes(request.data[request.id]);
  }

  replace(request, response) {
    winston.debug(`replace ${request.resourceName}/${request.id}`);

    if (!request.data[request.id])
      throw new NotFoundError(`resource ${request.resourceName}/${request.id} not found`);

    if (request.body.id && request.id !== request.body.id)
      throw new ConflictError(`tried to update resource ${request.resourceName}/${request.id} ID to ${request.body.id}`);

    request.data[request.id] = request.body;

    response.result = new Resource(request.resourceName, config.baseUrl)
      .attributes(request.body);
  }

  delete(request, response) {
    winston.debug(`delete ${request.resourceName}/${request.id}`);

    if (!request.data[request.id])
      throw new NotFoundError(`resource ${request.resourceName}/${request.id} not found`);

    delete request.data[request.id];
  }
};
