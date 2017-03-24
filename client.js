function SharedbAceRWControl(socket, ace) {
  let READ_ONLY;
  function toggleReadOnly() {
    if (READ_ONLY) {
      READ_ONLY = false;
      socket.send(JSON.stringify({
        mode: 'access-control:setWritable',
        aceId: ace.id,
      }));
    } else {
      READ_ONLY = true;
      socket.send(JSON.stringify({
        mode: 'access-control:setReadOnly',
        aceId: ace.id,
      }));
    } 
  }
  
  const _mode = prompt('You are a: lecturer (1), student (2)', 1);
  const mode = _mode === '1' ? 'lecturer' : 'student';
  const modeDisplay = document.createElement('span');
  
  if (mode === 'lecturer') {
    var toggle = document.createElement('button'); 
    toggle.style.cssText = 'position: absolute; top: 0; right: 0;';
    toggle.innerHTML = 'toggle';
    ace.container.appendChild(toggle);
    toggle.addEventListener('click', toggleReadOnly);
    socket.send(JSON.stringify({
      mode: 'access-control:init-lecturer',
      aceId: ace.id,
    }));
  } else {
    modeDisplay.innerHTML = 'LOADING';
    modeDisplay.style.cssText = 'position: absolute; bottom: 0; right: 0';
    ace.container.appendChild(modeDisplay);
    socket.send(JSON.stringify({
      mode: 'access-control:init-student',
      aceId: ace.id,
    }));
  }

  socket.addEventListener('message', (message) => {
    switch (message.data) {
    case 'access-control:setReadOnly':
      console.log(mode);
      READ_ONLY = true;
      if (mode === 'student') {
        ace.setReadOnly(true);
        modeDisplay.innerHTML = 'READ ONLY';
      } else {
        toggle.innerHTML= 'toggle writable';
      }
      break;
    case 'access-control:setWritable':
      console.log(mode);
      READ_ONLY = false;
      if (mode === 'student') {
        ace.setReadOnly(false);
        modeDisplay.innerHTML = 'WRITABLE';
      } else {
        toggle.innerHTML = 'toggle read-only';
      }
      break;
    default:
      break;
    }
  });
}

module.exports = SharedbAceRWControl;
