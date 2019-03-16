import '../bower_components/polymer/polymer-legacy.js';
import './te-devices.js';
import './te-form.js';

Polymer({
  _template: Polymer.html`
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

  listeners: {
    'te-device-created': 'reload'
  },

  reload: function() {
    this.$$('te-devices').reload();
  },

  ready: function() {
  }
});
