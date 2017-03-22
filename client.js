const Mousetrap = require('mousetrap');

Mousetrap.prototype.stopCallback = function (e, element) {
  return false;
};

function SharedbAceRWControl(socket, ace) {
  let READ_ONLY = ace.getReadOnly();
  const mode = prompt('You are a: lecturer (1), student (2)', 1);
  if (mode === '1') {
    Mousetrap.bind('ctrl+1', () => {
      if (READ_ONLY) {
        alert('making writable!');
        READ_ONLY = false;
        socket.send('access-control:setWritable');
      } else {
        alert('making read-only!');
        READ_ONLY = true;
        socket.send('access-control:setReadOnly');
      }
    });
    socket.send('access-control:init-lecturer');
  } else {
    socket.send('access-control:init-student');
  }

  socket.addEventListener('message', (message) => {
    switch (message.data) {
      case 'access-control:setReadOnly':
        ace.setReadOnly(true);
        break;
      case 'access-control:setWritable':
        ace.setReadOnly(false);
      default:
        break;
    }
  });
}

module.exports = SharedbAceRWControl;
