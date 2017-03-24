import redis from 'redis';

module.exports = function subscribe(redisUrl) {
  return (ctx) => {
    const pub = redis.createClient(redisUrl);
    const sub = redis.createClient(redisUrl);
    const rc = redis.createClient(redisUrl);

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
      console.log(msg);
      switch (msg.mode) {
      case 'access-control:init-lecturer': 
        rc.hget("access-control", msg.aceId, function(err, reply) {
          if (err) throw err;
          console.log(reply);
          if (reply === null) {
            rc.hset(["access-control", msg.aceId, false], function(err, reply) {
              if (err) throw err;
            });
            ctx.websocket.send('access-control:setWritable');
          } else if (reply === "true"){
            ctx.websocket.send('access-control:setReadOnly');
          } else {
            ctx.websocket.send('access-control:setWritable');
          }
          rc.quit();
        });
        break;
      case 'access-control:init-student':
        rc.hget("access-control", msg.aceId, function(err, reply) {
          console.log(reply);
          if (err) throw err;
          if (reply === null) {
            rc.hset(["access-control", msg.aceId, false], function(err, reply) {
              if (err) throw err;
            });
            ctx.websocket.send('access-control:setWritable');
          } else if (reply === "true") {
            ctx.websocket.send('access-control.setReadOnly');
          } else {
            ctx.websocket.send('access-control.setWritable');
          }
          rc.quit();
        }); 
        break;
      case 'access-control:setReadOnly':
        pub.publish('access-control', 'setReadOnly');
        console.log("here");
        const rc1 = redis.createClient(redisUrl);
        rc1.hset(["access-control", msg.aceId, true], function(err, reply) {
          if (err) throw err;
          rc1.quit();
        });
        break;
      case 'access-control:setWritable':
        pub.publish('access-control', 'setWritable');
        const rc2 = redis.createClient(redisUrl);
        rc2.hset(["access-control", msg.aceId, false], function(err, reply) {
          if (err) throw err;
          rc2.quit();
        });
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
