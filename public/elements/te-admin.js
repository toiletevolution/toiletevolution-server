import '@polymer/polymer/polymer-legacy.js';
import {Polymer} from '@polymer/polymer/lib/legacy/polymer-fn.js';
import {html} from '@polymer/polymer/lib/utils/html-tag.js';
import './te-devices.js';
import './te-form.js';

Polymer({
  _template: html`
    <style>
      :host {
        display: block;
        box-sizing: border-box;
        @apply(--layout-flex);
        @apply(--layout-vertical);
      }
    </style>

    <template is="dom-if" if="{{!add}}">
      <te-devices name="devices" device-id="{{deviceId}}" admin="true"></te-devices>
    </template>
    <template is="dom-if" if="{{add}}">
      <div name="device">
        <te-form></te-form>
      </div>
    </template>
`,

  is: 'te-admin',

  properties: {
    deviceId: {
      type: String
    },
    add: {
      type: Boolean,
      value: false
    }
  },

  reload: function() {
    this.$$('te-devices').reload();
  },

  ready: function() {
    this.addEventListener('te-device-created', this.reload);
  }
});
