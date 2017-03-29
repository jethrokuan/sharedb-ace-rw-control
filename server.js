import redis from 'redis';

function Exception(msg) {
  this.message = msg;
  this.name = 'Exception';
}

function redisInitValueFactory(redisUrl) {
  return function init(ctx, aceId) {
    const rc = redis.createClient(redisUrl);
    /* eslint-disable no-unused-vars */
    rc.hget('access-control', aceId, (err, readOnly) => {
      /* eslint-enable no-unused-vars */
      if (err) throw err;
      if (readOnly === null) {
        /* eslint-disable no-unused-vars */
        rc.hset(['access-control', aceId, false], (err2, readOnly2) => {
          /* eslint-enable no-unused-vars */
          if (err2) throw err;
        });
        ctx.websocket.send('access-control:setWritable');
      } else if (readOnly) {
        ctx.websocket.send('access-control:setReadOnly');
      } else {
        ctx.websocket.send('access-control:setWritable');
      }
      rc.quit();
    });
  };
}

function redisSetValueFactory(redisUrl) {
  return function set(aceId, value) {
    let val;
    if (value === 'read-only') {
      val = true;
    } else if (value === 'read-write') {
      val = false;
    } else {
      throw new Exception(`'Unhandled value type :${value}'`);
    }
    const rc = redis.createClient(redisUrl);
    /* eslint-disable no-unused-vars */
    rc.hset(['access-control', aceId, val], (err, readOnly) => {
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

    sub.on('message', (channel, message) => {
      if (channel === 'access-control') {
        if (message === 'setReadOnly') {
          ctx.websocket.send('access-control:setReadOnly');
        } else if (message === 'setWritable') {
          ctx.websocket.send('access-control:setWritable');
        } else {
          throw new Exception(`unhandled message: ${message}`);
        }
      }
    });

    sub.subscribe('access-control');

    ctx.websocket.on('message', (message) => {
      const msg = JSON.parse(message);
      switch (msg.mode) {
        case 'access-control:init-lecturer':
          init(ctx, msg.aceId);
          break;
        case 'access-control:init-student':
          init(ctx, msg.aceId);
          break;
        case 'access-control:setReadOnly':
          set(msg.aceId, 'read-only');
          pub.publish('access-control', 'setReadOnly');
          break;
        case 'access-control:setWritable':
          set(msg.aceId, 'read-write');
          pub.publish('access-control', 'setWritable');
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
