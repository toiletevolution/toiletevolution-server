import '../bower_components/polymer/polymer-legacy.js';
import '../bower_components/iron-ajax/iron-ajax.js';
import '../bower_components/iron-icon/iron-icon.js';
import '../bower_components/iron-icons/iron-icons.js';
import '../bower_components/paper-icon-button/paper-icon-button.js';
import '../bower_components/paper-item/paper-item.js';
import '../bower_components/paper-item/paper-item-body.js';

Polymer({
  _template: Polymer.html`
    <style>
      :host {
        display: block;
      }

    </style>
    <paper-item>
      <paper-item-body two-line="" id="body">
        <div class="layout inline">{{item.name}}</div>
        <div secondary="">{{count(item.thresholds)}}個の個室があります</div>
      </paper-item-body>
      <template is="dom-if" if="{{admin}}">
        <paper-icon-button id="delete" icon="icons:delete" on-click="delete"></paper-icon-button>
      </template>
    </paper-item>
    <iron-ajax id="ajax_delete" url="/admin/devices/{{item.id}}" method="DELETE" on-response="success" on-error="error"></iron-ajax>
`,

  is: 'te-device-item',

  properties: {
    item: {
      type: Object
    },
    admin: {
      type: Boolean
    }
  },

  listeners: {
    'body.tap': 'redirectDetail'
  },

  count: function(array) {
    return array.length;
  },

  redirectDetail: function() {
    location.href = location.href + '/' + this.item.id;
  },

  delete: function() {
    this.$.ajax_delete.generateRequest();
  },

  success: function(e, detail) {
    this.fire('te-device-deleted');
  },

  error: function(e, detail) {
    this.fire('iron-signal', {
      name: 'toaster-bake',
      data: {
        text: 'デバイスの削除に失敗しました',
        type: 'error'
      }
    });
  },

  ready: function() {
  }
});
