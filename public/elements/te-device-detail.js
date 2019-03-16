import '../bower_components/polymer/polymer-legacy.js';
import '../bower_components/google-map/google-map.js';
import '../bower_components/google-map/google-map-marker.js';
import '../bower_components/iron-ajax/iron-ajax.js';
import '../bower_components/iron-icon/iron-icon.js';
import '../bower_components/iron-icons/iron-icons.js';
import '../bower_components/iron-icons/maps-icons.js';
import '../bower_components/iron-icons/notification-icons.js';
import '../bower_components/iron-pages/iron-pages.js';
import '../bower_components/paper-styles/paper-styles.js';
import '../bower_components/paper-tabs/paper-tabs.js';
import './te-device-value-status.js';
import './te-device-value-graph.js';
import './te-icon.js';
import './mdi.js';

Polymer({
  _template: Polymer.html`
    <style>
      :host {
        display: block;
        height: 100%;
        @apply(--layout-flex);
        @apply(--layout-vertical);
      }
      iron-pages {
        height: calc(100% - 48px);
        box-sizing: border-box;
        padding: 10px 0;
        @apply(--layout-flex);
        @apply(--layout-vertical);
      }
      iron-pages > div {
        height: 100%;
      }
      .title {
        @apply(--paper-font-subhead);
        padding: 12px 24px;
      }
      paper-tabs {
        --paper-tabs-selection-bar-color: var(--dark-primary-color);
      }
    </style>

    <paper-tabs selected="{{selectedTab}}">
      <paper-tab><iron-icon icon="mdi:eye"></iron-icon></paper-tab>
      <paper-tab><iron-icon icon="maps:place"></iron-icon></paper-tab>
      <paper-tab><iron-icon icon="icons:info"></iron-icon></paper-tab>
    </paper-tabs>
    <iron-pages class="detail-tab" selected="{{selectedTab}}">
      <div>
        <h2 class="title">{{device.name}}</h2>
        <template is="dom-if" if="{{admin}}">
          <te-device-value-graph device="[[device]]" selected="[[selected]]"></te-device-value-graph>
        </template>
        <template is="dom-if" if="{{!admin}}">
          <te-device-value-status device="[[device]]" selected="[[selected]]"></te-device-value-status>
        </template>
      </div>
      <div>
        <google-map map="{{map}}" latitude="[[device.latitude]]" longitude="[[device.longitude]]" zoom="17" api-key="">
          <google-map-marker id="location" latitude="[[device.latitude]]" longitude="[[device.longitude]]"></google-map-marker>
        </google-map>
      </div>
      <div>
        <ul>
          <li>{{device.id}}</li>
        </ul>
      </div>
    </iron-pages>

    <iron-ajax id="ajax_detail" url="{{urlDetail}}" handle-as="json" method="GET" last-response="{{device}}"></iron-ajax>
`,

  is: 'te-device-detail',

  properties: {
    deviceId: {
      type: String,
      notify: true
    },
    admin: {
      type: Boolean,
      value: false
    },
    urlDetail: {
      type: String
    },
    selectedTab: {
      value: 0
    },
    selected: {
      type: Boolean,
      value: false,
      observer: 'doRequestIfSelected',
      notify: true
    }
  },

  doRequestIfSelected: function(selected) {
    if(selected) {
      this._deviceIdChanged(this.deviceId);
      this.$.ajax_detail.generateRequest();
    }
  },

  observers: [
    '_deviceIdChanged(deviceId)'
  ],

  _deviceIdChanged: function(deviceId) {
    if(this.selected) {
      var url = this.admin? '/admin/devices/' : '/api/devices/';
      this.urlDetail = url + deviceId;
    }
  }
});
