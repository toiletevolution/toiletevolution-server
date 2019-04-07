import '@polymer/polymer/polymer-legacy.js';
import {Polymer} from '@polymer/polymer/lib/legacy/polymer-fn.js';
import {html} from '@polymer/polymer/lib/utils/html-tag.js';
import '../scripts/excess-router/excess-router.js';
import '@polymer/iron-icon/iron-icon.js';
import '@polymer/iron-icons/iron-icons.js';
import '@polymer/iron-icons/notification-icons.js';
import '@polymer/paper-item/paper-item.js';
import '@polymer/paper-item/paper-item-body.js';
import '@polymer/paper-item/paper-icon-item.js';
import '@polymer/paper-item/paper-item-shared-styles.js';
import '../scripts/paper-menu/paper-menu.js';
import '../scripts/paper-menu/paper-submenu.js';

Polymer({
  _template: html`
    <style include="paper-item-shared-styles"></style>

    <style>

      :host {
        display: block;
      }
      .menu-content paper-item {
        padding-left: 48px;
      }
      .menu-content a,
      a#linkdoc {
        color: var(--menu-link-color);
        text-decoration: none;
      }
      .menu-content a.iron-selected paper-item {
        font-weight: var(--paper-item-selected-weight, bold);

        @apply(--paper-item-selected);
      }
      a iron-icon[icon="icons:open-in-new"] {
        --iron-icon-stroke-color: lightgray;
        --iron-icon-width: 18px;
        --iron-icon-height: 18px;
        margin-left: 0.5em;
      }
    </style>

    <excess-route route="/:page/(.*)?" page="{{page}}"></excess-route>
    <excess-route route="/devices/:id?" id="{{deviceId}}"></excess-route>
    <excess-route route="/admin/devices/:id?" id="{{deviceId}}"></excess-route>
    <excess-route route="/admin/device/add" active="{{addDevice}}"></excess-route>
    <excess-route route="/:page(bookmark|about|login)" page="{{page}}"></excess-route>
    <excess-route route="/(.*)" redirect-to="/devices" activation-modifiers="x"></excess-route>

    <paper-menu attr-for-item-title="label" class="horizontal-section">
      <paper-submenu label="toilets">
        <paper-icon-item slot="menu-trigger"><iron-icon icon="notification:wc" item-icon="" slot="item-icon"></iron-icon>トイレの空き状況</paper-icon-item>
        <paper-menu slot="menu-content" class="menu-content drawer-list" selected="[[page]]" attr-for-selected="name" role="navigation">
          <a href="#/devices" name="devices"><paper-item name="devices">トイレ一覧</paper-item></a>
          <a href="#/about" name="about"><paper-item>Toilet Evolutionについて</paper-item></a>
        </paper-menu>
      </paper-submenu>
      <paper-submenu label="settings">
        <paper-icon-item slot="menu-trigger"><iron-icon icon="icons:settings" item-icon="" slot="item-icon"></iron-icon>デバイス管理</paper-icon-item>
        <paper-menu slot="menu-content" class="menu-content drawer-list" selected="[[page]]" attr-for-selected="name" role="navigation">
          <a href="#/admin/devices" name="admin"><paper-item>登録済みトイレ一覧</paper-item></a>
          <template is="dom-if" if="{{notExists(user)}}">
            <a href="#/login" name="login"><paper-item>ログイン</paper-item></a>
          </template>
        </paper-menu>
      </paper-submenu>
      <paper-submenu label="apis">
        <a id="linkdoc" href="/docs/devices.html" target="_blank"><paper-icon-item><iron-icon icon="icons:description" item-icon="" slot="item-icon"></iron-icon><paper-item-body>APIドキュメント</paper-item-body><iron-icon icon="icons:open-in-new"></iron-icon></paper-icon-item></a>
      </paper-submenu>
      <template is="dom-if" if="{{!notExists(user)}}">
        <paper-icon-item><iron-icon src="{{user.avatar}}" item-icon="" slot="item-icon"></iron-icon>{{user.name}}</paper-icon-item>
      </template>

    </paper-menu>
`,

  is: 'te-menu',

  properties: {

    page: {
      type: String,
      observer: '_pageChanged',
      notify: true
    },
    deviceId: {
      type: String,
      notify: true
    },
    addDevice: {
      type: Boolean,
      notify: true
    },
    selectedTitle: {
      type: String,
      notify: true
    },
    user: {
      type: Object
    }

  },

  _pageChanged: function(page) {
    switch (page) {
      case 'admin':
        import('./te-admin.js');
        break;
      case 'devices':
        import('./te-devices.js');
        break;
      case 'login':
        import('./te-login.js');
        break;
      case 'about':
        import('./te-about.js');
        break;
    }
    var submenu = ({devices: 'toilets', bookmark: 'toilets', about: 'toilets', admin: 'settings', login: 'settings'})[page];
    this.$$('paper-submenu[label='+submenu+']').open();
    this.selectedTitle = ({devices: 'トイレの空き状況', bookmark: 'お気に入り', about: 'Toilet Evolutionについて', admin: 'デバイス管理', login: 'ログイン'})[page];
  },

  notExists: function(user) {
    return !user;
  },

  ready: function() {
    Excess.RouteManager.start();
  }
});
