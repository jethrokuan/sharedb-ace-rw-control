module.exports = {
  subscribe: (ctx, pub, sub) => {
    ctx.websocket.on('message', (message) => {
      switch (message) {
      case 'access-control:init-lecturer':
        break;
      case 'access-control:init-student':
        sub.on('message', (channel, message) => {
          if (channel === 'access-control') {
            if (message === 'setReadOnly') {
              ctx.websocket.send('access-control:setReadOnly');
            } else if (message === 'setWritable') {
              ctx.websocket.send('access-control:setWritable');
            } else {
              console.warn(`unhandled message: ${message}`);
            }
          }
        });
        sub.subscribe('access-control');
        break;
      case 'access-control:setReadOnly':
        pub.publish('access-control', 'setReadOnly');
        break;
      case 'access-control:setWritable':
        pub.publish('access-control', 'setWritable');
        break;
      default:
        break;
      }
    });
  },
};
