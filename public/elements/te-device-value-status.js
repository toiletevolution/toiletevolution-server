import '@polymer/polymer/polymer-legacy.js';
import {Polymer} from '@polymer/polymer/lib/legacy/polymer-fn.js';
import {html} from '@polymer/polymer/lib/utils/html-tag.js';
import '@polymer/iron-ajax/iron-ajax.js';
import '@polymer/iron-icon/iron-icon.js';
import '@polymer/paper-item/paper-icon-item.js';
import '@polymer/paper-item/paper-item-body.js';
import '@polymer/paper-styles/paper-styles.js';
import moment from 'moment';
//import 'moment/locale/ja';
import './te-icon.js';
import './mdi.js';


Polymer({
  _template: html`
    <style>
      :host {
        display: block;
      }
      .status-icon {
        --iron-icon-height: 100px;
        --iron-icon-width: 100px;
      }
      .status-table {
        overflow: auto;
      }
      .vacancy-mark {
        --iron-icon-fill-color: #3fca3e;
      }
      .occupied-mark {
        --iron-icon-fill-color: #fc404a;
      }
      tbody iron-icon {
        --iron-icon-width:  8px;
        --iron-icon-height: 8px;
      }
      table {
        font-size: 10px;
      }
      td, th {
        margin: 0;
        padding: 0;
      }
    </style>

    <template is="dom-repeat" items="[[deviceThresholds]]" as="threshold" index-as="roomIndex">

      <paper-icon-item>
        <iron-icon class="status-icon" icon="{{statusIcon(deviceValues, roomIndex, threshold)}}" item-icon="" slot="item-icon"></iron-icon>
        <paper-item-body class="status-table">
          <table>
            <thead><tr>
              <template is="dom-repeat" items="[[sortedDeviceValueHeaders(deviceValues)]]" as="deviceValueHeader">
                <th colspan\$="{{deviceValueHeader.colspan}}">{{timeAgo(deviceValueHeader.created)}}</th>
              </template>
              </tr></thead>
            <tbody><tr>
              <template is="dom-repeat" items="[[sortedDeviceValues(deviceValues)]]" as="deviceValue">
                <td>
                  <template is="dom-if" if="{{isOpenByRoomId(threshold, deviceValue, roomIndex)}}">
                    <iron-icon class="vacancy-mark" icon="mdi:checkbox-blank-circle" item-icon=""></iron-icon>
                  </template>
                  <template is="dom-if" if="{{!isOpenByRoomId(threshold, deviceValue, roomIndex)}}">
                    <iron-icon class="occupied-mark" icon="mdi:checkbox-blank-circle" item-icon=""></iron-icon>
                  </template>
                </td>
              </template>
              </tr></tbody>
          </table>

        </paper-item-body>
      </paper-icon-item>

    </template>
    <iron-ajax id="ajax_values" url="{{urlValues}}" handle-as="json" method="GET" last-response="{{deviceValues}}" on-response="repeatGetValues"></iron-ajax>
`,

  is: 'te-device-value-status',

  properties: {
    device: {
      type: Object,
      observer: 'getDeviceValues'
    },
    urlValues: {
      type: String
    },
    deviceThresholds: {
      type: Object
    },
    selected: {
      type: Boolean,
      value: false
    }
  },

  getDeviceValues: function(device) {
    this.deviceThresholds = device.thresholds;
    this.urlValues = '/api/devices/' + device.id + '/values';
    this.$.ajax_values.generateRequest();
  },

  repeatGetValues: function() {
    if(this.selected) {
      this.async(function() {
        this.$.ajax_values.generateRequest();
      }, 10000);
    }
  },

  statusIcon: function(values, roomId, threshold) {
    if(!values) {
      return;
    }
    var opened = true;
    var isOpen = this.isOpen;
    values.slice(-3).reverse().forEach(function(value) {
      if(!isOpen(threshold, value.payload[roomId])) {
        opened = false;
      }
    });
    return opened? 'te-icon:vacancy' : 'te-icon:occupied';
  },

  isOpenByRoomId: function(threshold, payloadValue, roomId) {
    if(!payloadValue) {
      return;
    }
    return this.isOpen(threshold, payloadValue.payload[roomId]);
  },

  isOpen: function(threshold, payloadValue) {
    return {
      gt: function(threshold, value) {
        return parseFloat(value) > parseFloat(threshold);
      },
      eq: function(threshold, value) {
        return parseFloat(value) == parseFloat(threshold);
      },
      lt: function(threshold, value) {
        return parseFloat(value) < parseFloat(threshold);
      }
    }[threshold.condition](threshold.value, payloadValue);
  },

  timeAgo: function(date) {
    var current = moment(date).fromNow();
    if(current == this.beforeTimeAgo) {
      return '';
    }
    this.beforeTimeAgo = current;
    return current;
  },

  sortedDeviceValueHeaders: function(values) {
    if(!values) {
      return;
    }
    var sorted = this.sortedDeviceValues(values);
    var first = sorted.shift();
    var headers = [{created: first.created, colspan: 1}];
    sorted.forEach(function(value){
      if(moment(value.created).fromNow() == moment(headers[headers.length-1].created).fromNow()) {
        headers[headers.length-1].colspan++;
      } else {
        headers.push({created: value.created, colspan: 1});
      }
    });
    return headers;
  },

  sortedDeviceValues: function(values) {
    if(!values) {
      return;
    }
    var sorted = [].concat(values);
    sorted.reverse();
    return sorted;
  },

  ready: function() {
    moment.locale('ja');
  }
});
