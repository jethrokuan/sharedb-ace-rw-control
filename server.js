import redis from 'redis';
import * as Enums from './enums';

function Exception(msg) {
  this.message = msg;
  this.name = 'Exception';
}

function redisInitValueFactory(redisUrl) {
  return function init(ctx, aceId) {
    const rc = redis.createClient(redisUrl);
    /* eslint-disable no-unused-vars */
    rc.hget(Enums.REDIS_DB_NAME, aceId, (err, readOnly) => {
      /* eslint-enable no-unused-vars */
      if (err) throw err;
      // NOTE: readOnly is either null, or the strings "true", "false"
      if (readOnly === null) {
        /* eslint-disable no-unused-vars */
        rc.hset([Enums.REDIS_DB_NAME, aceId, false], (err2, readOnly2) => {
          /* eslint-enable no-unused-vars */
          if (err2) throw err;
        });
        ctx.websocket.send(Enums.SET_WRITABLE);
      } else if (readOnly === 'true') {
        ctx.websocket.send(Enums.SET_READ_ONLY);
      } else if (readOnly === 'false') {
        ctx.websocket.send(Enums.SET_WRITABLE);
      } else {
        throw new Exception(`bad return from redis for access-control value: ${readOnly}`);
      }
      rc.quit();
    });
  };
}

function redisSetValueFactory(redisUrl) {
  return function set(aceId, value) {
    let val;
    if (value === Enums.READ_ONLY) {
      val = true;
    } else if (value === Enums.WRITABLE) {
      val = false;
    } else {
      throw new Exception(`'Unhandled value type :${value}'`);
    }
    const rc = redis.createClient(redisUrl);
    /* eslint-disable no-unused-vars */
    rc.hset([Enums.REDIS_DB_NAME, aceId, val], (err, readOnly) => {
      /* eslint-enable no-unused-vars */
      if (err) throw err;
      rc.quit();
    });
  };
}

module.exports = function subscribe(redisUrl) {
  return (ctx) => {
    const pub = redis.createClient(redisUrl);
    const sub = redis.createClient(redisUrl);

    const init = redisInitValueFactory(redisUrl);
    const set = redisSetValueFactory(redisUrl);

    sub.on('message', (channel, action) => {
      if (channel === Enums.REDIS_SUB_CHANNEL) {
        if (action === Enums.READ_ONLY) {
          ctx.websocket.send(Enums.SET_READ_ONLY);
        } else if (action === Enums.WRITABLE) {
          ctx.websocket.send(Enums.SET_WRITABLE);
        } else {
          throw new Exception(`unhandled message: ${action}`);
        }
      }
    });

    sub.subscribe(Enums.REDIS_SUB_CHANNEL);

    ctx.websocket.on('message', (message) => {
      const msg = JSON.parse(message);
      switch (msg.mode) {
        case Enums.INIT_LECTURER:
          init(ctx, msg.aceId);
          break;
        case Enums.INIT_STUDENT:
          init(ctx, msg.aceId);
          break;
        case Enums.SET_READ_ONLY:
          set(msg.aceId, Enums.READ_ONLY);
          pub.publish(Enums.REDIS_SUB_CHANNEL, Enums.READ_ONLY);
          break;
        case Enums.SET_WRITABLE:
          set(msg.aceId, Enums.WRITABLE);
          pub.publish(Enums.REDIS_SUB_CHANNEL, Enums.WRITABLE);
          break;
        default:
          break;
      }
    });

    // TODO: handle reconnects
    /* eslint-disable no-unused-vars */
    ctx.websocket.on('close', (event) => {
      /* eslint-enable no-unused-vars */
      sub.unsubscribe();
      sub.quit();
      pub.quit();
    });
  };
};
