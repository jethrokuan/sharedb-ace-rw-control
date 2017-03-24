import redis from 'redis';

function redisInitValueFactory(redisUrl) {
  return function init(ctx, aceId) {
    const rc = redis.createClient(redisUrl);
    rc.hget("access-control", aceId, function(err, readOnly) {
      if (err) throw err;
      if (readOnly === null) {
        rc.hset(["access-control", aceId, false], function(err, readOnly) {
          if (err) throw err;
        });
        ctx.websocket.send('access-control:setWritable');
      } else if (readOnly === true){
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
    if (value === "read-only") {
      val = true;
    } else if (value === "read-write") {
      val = false;
    } else {
      throw new Exception(`"Unhandled value type :${value}"`);
    }
    const rc = redis.createClient(redisUrl);
    rc.hset(["access-control", aceId, val], function(err, readOnly) {
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
              if (message  === 'setReadOnly') {
                ctx.websocket.send('access-control:setReadOnly');
              } else if (message === 'setWritable') {
                ctx.websocket.send('access-control:setWritable');
              } else {
                console.warn(`unhandled message: ${message}`);
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
        set(msg.aceId, "read-only");
        pub.publish('access-control', 'setReadOnly'); 
        break;
      case 'access-control:setWritable':
        set(msg.aceId, "read-write");
        pub.publish('access-control', 'setWritable'); 
        break;
      default:
        break;
      }
    });

    // TODO: handle reconnects
    ctx.websocket.on('close', (event) => {
      sub.unsubscribe();
      sub.quit();
      pub.quit();
    });
  };
};
