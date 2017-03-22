function SharedbAceRWControl(socket, ace) {
  socket.on('message', (message) => {
    switch (message.data) {
    case "access-control:lecturer":
      doSomething();
      break;
    default:
      break;
    }
  });
  
  console.log(this.extensionSocket);
}

module.exports = SharedbAceRWControl;
