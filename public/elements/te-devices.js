import '../bower_components/polymer/polymer-legacy.js';
import '../bower_components/iron-pages/iron-pages.js';
import '../bower_components/paper-styles/paper-styles.js';
import './te-device-detail.js';
import './te-device-item.js';
import './te-device-list.js';
import './te-icon.js';
import './mdi.js';

Polymer({
  _template: Polymer.html`
    <style>
      :host {
        display: block;
        @apply(--layout-flex);
        @apply(--layout-vertical);
      }
      iron-pages {
        height: 100%;
        @apply(--layout-flex);
        @apply(--layout-vertical);
      }
    </style>

    <iron-pages selected="[[page]]" attr-for-selected="name">
      <te-device-list name="list" admin="{{admin}}" selected="{{pageSelected(page, 'list')}}"></te-device-list>
      <te-device-detail name="detail" device-id="{{deviceId}}" admin="{{admin}}" selected="{{pageSelected(page, 'detail')}}"></te-device-detail>
    </iron-pages>
`,

  is: 'te-devices',

  properties: {
    deviceId: {
      type: String,
      notify: true
    },
    admin: {
      type: Boolean,
      value: false
    },
    page: {
      type: String
    }
  },

  observers: [
    '_deviceIdChanged(deviceId)'
  ],

  pageSelected: function(page, name) {
    return page === name;
  },

  _deviceIdChanged: function(deviceId) {
    this.page = deviceId? 'detail' : 'list';
  },

  reload: function() {
    this.$$('te-device-list').reload();
  },

  ready: function() {
    this._deviceIdChanged(this.deviceId);
  }
});
