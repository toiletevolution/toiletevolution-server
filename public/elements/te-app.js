/**
@license
Copyright (c) 2016 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/
import '../bower_components/polymer/polymer-legacy.js';

import '../bower_components/app-layout/app-drawer-layout/app-drawer-layout.js';
import '../bower_components/app-layout/app-drawer/app-drawer.js';
import '../bower_components/app-layout/app-scroll-effects/app-scroll-effects.js';
import '../bower_components/app-layout/app-header/app-header.js';
import '../bower_components/app-layout/app-header-layout/app-header-layout.js';
import '../bower_components/app-layout/app-toolbar/app-toolbar.js';
import '../bower_components/excess-router/excess-router.js';
import '../bower_components/iron-ajax/iron-ajax.js';
import '../bower_components/iron-flex-layout/iron-flex-layout.js';
import '../bower_components/iron-icon/iron-icon.js';
import '../bower_components/iron-icons/iron-icons.js';
import '../bower_components/iron-icons/notification-icons.js';
import '../bower_components/iron-pages/iron-pages.js';
import '../bower_components/paper-icon-button/paper-icon-button.js';
import '../bower_components/paper-styles/paper-styles.js';
import '../bower_components/toast-er/toast-er.js';
import './te-devices.js';
import './te-admin.js';
import './te-login.js';
import './te-about.js';
import './te-icons.js';
import './te-menu.js';
import './te-theme.js';

Polymer({
  _template: Polymer.html`
    <style>

      :host {
        display: block;
        height: 100%;
        --app-primary-color: var(--default-primary-color);
        --app-secondary-color: var(--primary-text-color);
      }

      app-header {
        background-color: var(--app-primary-color);
        color: #fff;
      }
      app-header paper-icon-button {
        --paper-icon-button-ink-color: white;
      }
      iron-pages {
        height: 100%;
        background-color: white;
        @apply(--layout-vertical);
        @apply(--layout-flex);
      }
      iron-icon.logo {
        --iron-icon-height: 48px;
        --iron-icon-width: 48px;
      }
      .title {
        margin-left: 16px;
      }
      app-drawer {
        border: var(--drawer-border-color);
      }
      app-drawer > app-toolbar {
        border-bottom: var(--drawer-border-color);
      }
    </style>

    <app-drawer-layout fullbleed="" narrow="{{narrow}}">

      <!-- Drawer content -->
      <app-drawer>
        <app-toolbar>
          <iron-icon class="logo" src="../images/logo.png"></iron-icon>
          <div class="title">Toilet Evolution</div>
        </app-toolbar>
        <te-menu page="{{page}}" device-id="{{deviceId}}" add-device="{{addDevice}}" selected-title="{{title}}" user="{{currentUser}}"></te-menu>
      </app-drawer>

      <!-- Main content -->
      <app-header-layout has-scrolling-region="">

        <app-header fixed="" condenses="" effects="waterfall">
          <app-toolbar>
            <paper-icon-button icon="menu" drawer-toggle=""></paper-icon-button>
            {{title}}
          </app-toolbar>
        </app-header>

        <iron-pages role="main" selected="[[page]]" attr-for-selected="name">
          <te-devices name="devices" device-id="{{deviceId}}"></te-devices>
          <te-admin name="admin" device-id="{{deviceId}}" add="{{addDevice}}"></te-admin>
          <te-login name="login"></te-login>
          <te-about name="about"></te-about>
        </iron-pages>
        <toast-er></toast-er>

      </app-header-layout>

    </app-drawer-layout>
    <iron-ajax auto="" id="ajax_current_user" url="/api/user/current" handle-as="json" method="GET" last-response="{{currentUser}}"></iron-ajax>
`,

  is: 'te-app',

  properties: {
    currentUser: {
      type: Object
    }
  },

  listeners: {
    'te-device-created': 'reload',
    'te-device-deleted': 'reload',
    'excess-route-will-activate': 'routeChange'
  },

  reload: function() {
    this.$$('te-devices').reload();
  },

  routeChange: function(e) {
    if(!this.currentUser && e.detail.transaction.destinations[0].routeParams.page == 'admin') {
      e.detail.transaction.abort({redirectTo: '/login'});
    }
    if(!this.currentUser && e.detail.transaction.destinations[0].routeParams.page == 'logined') {
      e.detail.transaction.abort();
      this.listen(this.$.ajax_current_user, 'response', 'logined');
      this.$.ajax_current_user.generateRequest();
    }
  },

  logined: function() {
    this.unlisten(this.$.ajax_current_user, 'response', 'logined');
    location.href = '/#/admin/devices';
  }
});
