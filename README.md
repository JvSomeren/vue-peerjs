# Vue-PeerJS

[PeerJS](https://peerjs.com/) bindings for Vue.js and Vuex (inspired by [Vue-Socket.io-Extended](https://github.com/probil/vue-socket.io-extended))

## Requirements

* [Vue.js](https://vuejs.org/) `>=2.X`
* [PeerJS](https://socket.io) `>=1.X`
* [Vuex](https://vuex.vuejs.org/) `>=2.X` (optional, for integration with Vuex only)

## Installation

```bash
npm install vue-peerjs peerjs
```

## Initialization

#### ES2015 (Webpack/Rollup/Browserify/Parcel/etc)
``` js
import VuePeerJS from 'vue-peerjs';
import Peer from 'peerjs';

Vue.use(VuePeerJS, new Peer({});
```
*Note:* you have to pass instance of `peerjs` as second argument to prevent library duplication.

#### UMD (Browser)

``` html
<script src="https://cdn.jsdelivr.net/npm/vue/dist/vue.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/peerjs@1.0.0"></script>
<script src="https://cdn.jsdelivr.net/npm/vue-peerjs"></script>
<script>
  Vue.use(VuePeerJS, new Peer({}));
</script>
```

## Usage

#### On Vue.js component

``` js
new Vue({
  methods: {
    clickButton(val) {
      // this.$peer is `peerjs` instance
      const dataConnection = this.$peer.connect(id);
      this.$peer.on('open', function(id) { ... });
    }
  }
})
```

**Note**: Don't use arrow functions for methods or listeners if you are going to emit `socket.io` events inside. You will end up with using incorrect `this`.

#### Typescript

Currently the typing aren't configured correctly to correct for this please add the following shim.

```typescript
// -- file: src/shims-vue-peerjs.d.ts --- //
import Peer from 'peerjs';

declare module 'vue/types/vue' {
  interface Vue {
    $peer: Peer;
  }
}
```

## Vuex Store integration

To enable Vuex integration just pass the store as the third argument, e.g.:
``` js
import store from './store'

Vue.use(VuePeerJS, new Peer({}), { store });
```

The main idea behind the integration is that mutations and actions are dispatched/committed automatically on Vuex store when a peer/dataConnection/mediaConnection event arrives. Not every mutation and action is invoked. It should follow special formatting convention, so the plugin can easily determine which one should be called. 

* a **mutation** should start with `PEER_` prefix and continue with an uppercase version of the event
* an **action** should start with `peer_` prefix and continue with camelcase version of the event

@TODO

| Server Event | Mutation | Action
| --- | --- | --- |
| `chat message` | `SOCKET_CHAT MESSAGE` | `socket_chatMessage` |
| `chat_message` | `SOCKET_CHAT_MESSAGE` | `socket_chatMessage` |
| `chatMessage`  | `SOCKET_CHATMESSAGE`  | `socket_chatMessage` |
| `CHAT_MESSAGE` | `SOCKET_CHAT_MESSAGE` | `socket_chatMessage` |

Check [Configuration](#gear-configuration) section if you'd like to use custom transformation.

**Note**: different server events can commit/dispatch the same mutation or/and the same action. So try to use only one naming convention to avoid possible bugs. In any case, this behavior is going to be changed soon and considered as problematic.

You can use either mutation or action or even both in your store. Don't forget that mutations are synchronous transactions. If you have any async operations inside, it's better to use actions instead. Learn more about Vuex [here](https://vuex.vuejs.org/en/).

```js
import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    id: null,
    error: null,
  },
  mutations: {
    PEER_OPEN(state, id) {
      state.id = id;
    },
    PEER_ERROR(state, error) {
      state.error = error;
    },
  },
  actions: {
    otherAction(context, type) {
      return true;
    },
    PEER_ERROR({ commit, dispatch }, error) {
      dispatch('newError', error);
      commit('NEW_ERROR_RECEIVED', error);
      // ...
    },
  },
})
```

#### Namespaced vuex modules

Namespaced modules are supported out-of-the-box when plugin initialized with Vuex store. You can easily divide your store into modules without worrying that mutation or action will not be called. The plugin checks all your modules for mutation and action that are formatted by convention described above and call them all. That means you can listen for the same event from multiple stores with no issue.

Check the following example:

```js
import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex);

const messages = {
  state: {
    messages: []
  },
  mutations: {
    PEER_DATA(state, {args, dataConnection}) {
      state.messages.push(args[0]);
    }
  },
  actions: {
    peer_data() {
      console.log('this action will be called');
    }
  },
};

const notifications = {
  state: {
    notifications: []
  },
  mutations: {
    PEER_DATA(state, {args, dataConnection}) {
      state.notifications.push({ type: 'message', payload: args[0] });
    }
  },
}

export default new Vuex.Store({
  modules: {
    messages,
    notifications,
  }
})
```

That's what will happen, on `data` from a dataConnection:
* `PEER_DATA` mutation commited on `messages` module
* `PEER_DATA` mutation commited on `notification` module
* `peer_data` action dispatched on `messages` module

## Configuration

In addition to store instance, `vue-peerjs` accepts other options. 
Here they are:

| Option | Type | Default | Description |
| ---- | ---- | ------- | ------- |
| `store` | `Object` | `undefined` | Vuex store instance, enables vuex integration |
| `actionPrefix` | `String` | `'peer_'` | Prepend to event name while converting event to action. Empty string disables prefixing |
| `mutationPrefix` | `String` | `'PEER_'` | Prepend to event name while converting event to mutation. Empty string disables prefixing |  
| `eventToMutationTransformer` | `Function` `string => string` | uppercase function | Determines how event name converted to mutation |
| `eventToActionTransformer` | `Function` `string => string` | camelcase function | Determines how event name converted to action |

*FYI:* You can always access default plugin options if you need it (e.g. re-use default `eventToActionTransformer` function):

```js
import VuePeerJS from 'vue-peerjs';
VuePeerJS.defaults // -> { actionPrefix: '...', mutationPrefix: '...', ... }
```

## Roadmap

* [ ] Set correct typings
* [ ] Add global mixin

## Contribution

I'd be more than happy to see potential contributions, so don't hesitate. If you have any suggestions, ideas or problems feel free to add new [issue](https://github.com/JvSomeren/vue-peerjs/issues/new), but first please make sure your question does not repeat previous ones.

Also a huge shoutout to [Vue-Socket.io-Extended](https://github.com/probil/vue-socket.io-extended)! 
A large portion of the code is based on that package and it was a great example when building this package.

## License

See the [LICENSE](LICENSE) file for license rights and limitations (MIT).
