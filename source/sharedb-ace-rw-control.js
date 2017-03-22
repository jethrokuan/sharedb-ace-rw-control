function SharedbAceRWControl(socket, ace) {
  socket.addEventListener('message', (message) => {
    switch (message.data) {
    case "access-control:lecturer":
      doSomething();
      break;
    default:
      break;
    }
  });
}

module.exports = SharedbAceRWControl;
