# Sharedb-ace-rw-control
[![npm version](https://badge.fury.io/js/sharedb-ace-rw-control.svg)](https://badge.fury.io/js/sharedb-ace-rw-control)

Plugin for [sharedb-ace](https://github.com/jethrokuan/sharedb-ace), that enables access control. Specifically, it enables 2 levels: lecturer and student.

## Installation

```
npm install sharedb-ace-rw-control
```

### Server
```js
import SharedbAceRWControl from 'sharedb-ace-rw-control/server';

router.get('/ws', async (ctx) => {
  const rw = SharedbAceRWControl(REDIS_URL);
  rw(ctx);
});
```

### Client
1. Using =node=
```js
import SharedbAceRWControl from "sharedb-ace-rw-control/client";
const editor = ace.edit("editor"); 
const ShareAce = new sharedbAce(id, { ... });
ShareAce.on('ready', function() {
  ShareAce.add(editor, ["path"], [
    SharedbAceRWControl
  ]);
});
```

2. Use CDN

```
https://unpkg.com/sharedb-ace-rw-control@0.0.2/dist/sharedb-ace-rw-control.client.js
```
