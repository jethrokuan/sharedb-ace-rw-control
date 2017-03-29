/* eslint-env browser */
import * as Enums from './enums';

/**
 * The interface for the ShareDB Ace client to enable access control.
 * @param {WebSocket} socket - websocket url connections
 * @param {} ace - ace instance
 */
function SharedbAceRWControl(socket, ace) {
  /* READ_ONLY: boolean
     client-local variable, which will always contain the most
     up-to-date information about whether the ace instance is
     read-only or writable */
  let READ_ONLY;
  function toggleReadOnly() {
    if (READ_ONLY === true) {
      READ_ONLY = false;
      socket.send(JSON.stringify({
        mode: Enums.SET_WRITABLE,
        aceId: ace.id,
      }));
    } else {
      READ_ONLY = true;
      socket.send(JSON.stringify({
        mode: Enums.SET_READ_ONLY,
        aceId: ace.id,
      }));
    }
  }

  const $mode = window.prompt('You are a: lecturer (1), student (2)', 1);
  const mode = $mode === '1' ? Enums.LECTURER : Enums.STUDENT;

  // modeDisplay is displayed at the bottom right corner, an indication
  // of whether the ace instance is READ-ONLY or WRITABLE
  //
  // visible to "students" only
  const modeDisplay = document.createElement('span');

  // toggle is a button which allows the lecturer to change the
  // ace instance access-control level
  //
  // visible to "lecturers" only
  const toggle = document.createElement('button');

  // Perform initial DOM setup
  if (mode === Enums.LECTURER) {
    toggle.style.cssText = 'position: absolute; top: 0; right: 0;';
    toggle.innerHTML = 'toggle';
    ace.container.appendChild(toggle);
    toggle.addEventListener('click', toggleReadOnly);
    socket.send(JSON.stringify({
      mode: Enums.INIT_LECTURER,
      aceId: ace.id,
    }));
  } else {
    modeDisplay.innerHTML = 'LOADING';
    modeDisplay.style.cssText = 'position: absolute; bottom: 0; right: 0';
    ace.container.appendChild(modeDisplay);
    socket.send(JSON.stringify({
      mode: Enums.INIT_STUDENT,
      aceId: ace.id,
    }));
  }

  socket.addEventListener('message', (message) => {
    switch (message.data) {
      case Enums.SET_READ_ONLY:
        READ_ONLY = true;
        if (mode === Enums.STUDENT) {
          ace.setReadOnly(true);
          modeDisplay.innerHTML = Enums.READ_ONLY;
        } else {
          toggle.innerHTML = `toggle ${Enums.WRITABLE}`;
        }
        break;
      case Enums.SET_WRITABLE:
        READ_ONLY = false;
        if (mode === Enums.STUDENT) {
          ace.setReadOnly(false);
          modeDisplay.innerHTML = Enums.WRITABLE;
        } else {
          toggle.innerHTML = `toggle ${Enums.READ_ONLY}`;
        }
        break;
      default:
        break;
    }
  });
}

module.exports = SharedbAceRWControl;
