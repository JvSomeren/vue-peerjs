import {PluginFunction} from 'vue';
import * as PeerJS from './peerjs';
// augment typings of Vue.js
import './vue';

export interface PeerToVuexOptions {
  actionPrefix?: string;
  mutationPrefix?: string; // @TODO more options?
}

export interface VuePeerJSOptions extends PeerToVuexOptions {
  peer: PeerJS;
}

declare class VuePeerJS {
    static install: PluginFunction<VuePeerJSOptions>;
    static defaults: PeerToVuexOptions;
}

export default VuePeerJS;
