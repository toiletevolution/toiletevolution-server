import '@polymer/polymer/polymer-legacy.js';
import {Polymer} from '@polymer/polymer/lib/legacy/polymer-fn.js';
import {html} from '@polymer/polymer/lib/utils/html-tag.js';
import '../scripts/geo-location/geo-location.js';
import '../scripts/gold-password-input/gold-password-input.js';
import '../scripts/google-map/google-map.js';
import '@polymer/iron-ajax/iron-ajax.js';
import '@polymer/iron-flex-layout/iron-flex-layout.js';
import '@polymer/iron-form/iron-form.js';
import '@polymer/iron-label/iron-label.js';
import '@polymer/paper-input/paper-input.js';
import '@polymer/paper-button/paper-button.js';
import '@polymer/paper-dropdown-menu/paper-dropdown-menu.js';
import '@polymer/paper-item/paper-item.js';
import '@polymer/paper-listbox/paper-listbox.js';
import '@polymer/paper-spinner/paper-spinner.js';
import '@polymer/paper-card/paper-card.js';
import '@polymer/paper-styles/paper-styles.js';

Polymer({
  _template: html`
    <style>
      :host {
        display: block;
      }
      paper-card {
        width: 100%;
        padding: 20px 40px;
        box-sizing: border-box;
        background-color: white;
      }
      google-map {
        height: 400px;
      }
      paper-input {
        margin-bottom: 2em;
      }
      .flex-horizontal {
        @apply(--layout-horizontal);
      }
      .flex-horizontal paper-input {
        @apply(--layout-flex);
      }
      .geo {
        margin-top: 2em;
        display: block;
      }
      .buttons {
        @apply(--layout-horizontal);
        @apply(--layout-end-justified);
        width: 100%;
        box-sizing: border-box;
        margin-top: 32px;
      }
      paper-dropdown-menu {
        --paper-input-container-label: {
          @apply(--paper-font-menu);
        }
      }
      paper-dropdown-menu paper-item {
        --paper-item: {
          @apply(--paper-font-menu);
        }
      }
    </style>

    <paper-card>
      <h2 class="title">新規デバイス登録</h2>
      <form id="form" is="iron-form">
        <paper-input label="デバイス名" name="name" id="name" value="{{name}}" required="" auto-validate="" error-message="必ず入力してください"></paper-input>
        <gold-password-input label="パスワード" name="password" id="password" value="{{password}}" required="" auto-validate="" error-message="必ず入力してください" strength-meter="" strength-meter-labels="{{strengthMeterLabels}}"></gold-password-input>
        <paper-input label="パスワード(確認)" name="repass" id="repass" value="{{repass}}" invalid="{{repassInValid}}" type="password" error-message="パスワードが一致していません"></paper-input>
        <paper-input label="個室の数" name="numOfRooms" id="numOfRooms" value="{{num_of_rooms}}" type="number" min="1" required="" auto-validate="" error-message="必ず入力してください"></paper-input>
        <fieldset id="threshold">
          <legend>個室毎のしきい値</legend>
          <template is="dom-repeat" items="{{rooms}}">
            <iron-label>
              <span>センサー{{index}}</span>
              <div class="flex-horizontal">
                <paper-input id="threshold_value_{{index}}" required="" auto-validate="" error-message="必ず入力してください"></paper-input>
                <paper-dropdown-menu label="空室判定条件" id="threshold_condition_{{index}}" required="">
                  <paper-listbox class="dropdown-content">
                    <paper-item>より大きい場合は空室</paper-item>
                    <paper-item>と等しい場合は空室</paper-item>
                    <paper-item>より小さい場合は空室</paper-item>
                  </paper-listbox>
                </paper-dropdown-menu>
              </div>
            </iron-label>

          </template>
          <small>しきい値はアプリ上で空室判定に利用されます。</small>
        </fieldset>

        <geo-location id="loc" latitude="{{lat}}" longitude="{{lng}}"></geo-location>
        <iron-label class="geo">
          設置場所
          <google-map map="{{map}}" latitude="[[lat]]" longitude="[[lng]]" zoom="17" api-key="">
            <google-map-marker slot="google-map-marker" id="location" latitude="[[lat]]" longitude="[[lng]]" draggable="true"></google-map-marker>
          </google-map>
        </iron-label>

        <div class="buttons">
          <template is="dom-if" if="{{!loading}}">
            <div class="buttons">
              <paper-button raised="" on-click="submitForm">登録</paper-button>
            </div>
          </template>
          <template is="dom-if" if="{{loading}}">
            <paper-spinner alt="登録中です。しばらくお待ちください" active=""></paper-spinner>
          </template>
        </div>
      </form>
    </paper-card>


    <iron-ajax id="ajax" url="/admin/device" handle-as="json" method="POST" body="{{ajaxObject}}" on-response="success" on-error="error" loading="{{loading}}" content-type="application/json"></iron-ajax>
`,

  is: 'te-form',

  //        behaviors: [AppBehaviors.CsrfBehavior],
  properties: {
    name: {
      type: String,
      notify: true
    },
    strengthMeterLabels: {
      type: Object
    },
    password: {
      type: String,
      notify: true
    },
    repass: {
      type: String,
      notify: true
    },
    repassInValid: {
      type: Boolean,
      value: false
    },
    num_of_rooms: {
      type: Number,
      notify: true,
      value: 1
    },
    loading: {
      type: Boolean,
      value: false
    },
    rooms: {
      type: Array,
      value: [],
      notify: true
    },
    ajaxBody: {
      type: Object
    }

  },

  listeners: {
    'password-changed': 'validatePassword',
    'repass-changed': 'validatePassword',
    'num_of_rooms-changed': 'changeRoomsArray'
  },

  // private
  validatePassword: function() {
    this.repassInValid = (this.password !== this.repass);
  },

  changeRoomsArray: function() {
    this.set('rooms', new Array(parseInt(this.num_of_rooms)));
  },

  submitForm: function() {
    if (!this.$.form.noValidate && this.$.form.validate()) {
      this.set('ajaxObject', {
        name: this.name,
        password: this.password,
        thresholds: this.createThresholds(),
        location: {
          latitude: this.$.location.latitude,
          longitude: this.$.location.longitude
        }
      });
      this.$.ajax.generateRequest();
    }
  },

  createThresholds: function() {
    var conditions = [
      {key: 'gt', value: 'より大きい場合は空室'},
      {key: 'eq', value: 'と等しい場合は空室'},
      {key: 'lt', value: 'より小さい場合は空室'}
    ];
    var results = [];
    for(var i = 0; i < parseInt(this.num_of_rooms); i++) {
      results.push({
        value: this.$$('#threshold_value_'+i).value,
        condition: conditions.find(function(condition) { return condition.value == this; }, this.$$('#threshold_condition_'+i).value).key
      });
    }
    return results;
  },

  success: function(e, detail) {
    this.fire('te-device-created');
    location.href = '/#/admin/devices';
  },

  error: function(e, detail) {
    this.fire('iron-signal', {
      name: 'toaster-bake',
      data: {
        text: 'デバイスの登録に失敗しました',
        type: 'error'
      }
    });
  },

  ready: function() {
    this.$.ajax.headers = {
      "X-Requested-With": "XMLHttpRequest"
    };
    this.strengthMeterLabels = {
      Label: 'パスワードの強さ',
      None: 'なし',
      VeryWeak: '危険',
      Weak: '弱い',
      Medium: '普通',
      Strong: '強い',
      VeryStrong: '安全'
    };
  }
});
