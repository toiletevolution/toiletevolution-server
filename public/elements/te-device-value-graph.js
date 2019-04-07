import '@polymer/polymer/polymer-legacy.js';
import {Polymer} from '@polymer/polymer/lib/legacy/polymer-fn.js';
import {html} from '@polymer/polymer/lib/utils/html-tag.js';
import '@google-web-components/google-chart/google-chart.js';
import '@polymer/iron-ajax/iron-ajax.js';
import '@polymer/paper-styles/paper-styles.js';
import moment from 'moment';
//import 'moment/locale/ja';

Polymer({
  _template: html`
    <style>
      :host {
        display: block;
      }
      google-chart {
        width: 100%;
      }
    </style>

    <template is="dom-repeat" items="[[deviceThresholds]]" as="threshold" index-as="roomIndex">
      <google-chart type="line" options="{{chartOption(roomIndex)}}" data="{{chartData(deviceValues, roomIndex, threshold)}}">
      </google-chart>
    </template>
    <iron-ajax id="ajax_values" url="{{urlValues}}" handle-as="json" method="GET" last-response="{{deviceValues}}" on-response="repeatGetValues"></iron-ajax>
`,

  is: 'te-device-value-graph',

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

  chartData: function(values, roomIndex, threshold) {
    var data = [[{type: 'datetime', label: '日時'}, {type: 'number', label: '計測値'}, {type: 'number', label:'しきい値'}]];
    (values || []).forEach(function(value){
      data.push([moment(value.created).toDate(), value.payload[roomIndex], parseFloat(threshold.value)]);
    });
    return data;
  },

  chartOption: function(roomIndex) {
    return {title: "センサー"+roomIndex};
  },

  ready: function() {
    moment.locale('ja');
  }
});
