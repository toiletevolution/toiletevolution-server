import '../bower_components/polymer/polymer-legacy.js';
import '../bower_components/iron-ajax/iron-ajax.js';
import '../bower_components/paper-fab/paper-fab.js';
import '../bower_components/paper-listbox/paper-listbox.js';
import '../bower_components/paper-styles/paper-styles.js';
import './te-device-item.js';

Polymer({
  _template: Polymer.html`
    <style>
      :host {
        display: block;
        @apply(--layout-flex);
        @apply(--layout-vertical);
      }
      app-toolbar {
        @apply(--paper-font-subhead);
      }
      #add-fab {
        position: fixed;
        right: 16px;
        bottom: 16px;
      }
    </style>

    <app-toolbar>{{devices.length}}件のトイレが登録されています。</app-toolbar>
    <paper-listbox>
      <template is="dom-repeat" items="[[devices]]">
        <te-device-item item="{{item}}" admin="[[admin]]"></te-device-item>
      </template>
    </paper-listbox>
    <template is="dom-if" if="{{admin}}">
      <a href="#/admin/device/add" id="add-fab"><paper-fab icon="add"></paper-fab></a>
    </template>

    <iron-ajax id="ajax" url="{{url}}" handle-as="json" method="GET" last-response="{{devices}}"></iron-ajax>
`,

  is: 'te-device-list',

  properties: {
    admin: {
      type: Boolean,
      value: false
    },
    url: {
      type: String
    },
    selected: {
      type: Boolean,
      value: false,
      observer: 'doRequestIfSelected',
      notify: true
    }
  },

  listeners: {
    'te-device-deleted': 'reload'
  },

  doRequestIfSelected: function(selected) {
    if(selected) {
      this.reload();
    }
  },

  reload: function() {
    this.devices = [];
    this.$.ajax.generateRequest();
  },

  ready: function() {
    this.url = this.admin? '/admin/devices' : '/api/devices';
  }
});
