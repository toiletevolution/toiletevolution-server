/**
@license
Copyright (c) 2016 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/
import '@polymer/polymer/polymer-legacy.js';
import {Polymer} from '@polymer/polymer/lib/legacy/polymer-fn.js';
import {html} from '@polymer/polymer/lib/utils/html-tag.js';
import '@polymer/app-layout/app-drawer-layout/app-drawer-layout.js';
import '@polymer/app-layout/app-drawer/app-drawer.js';
import '@polymer/app-layout/app-scroll-effects/app-scroll-effects.js';
import '@polymer/app-layout/app-header/app-header.js';
import '@polymer/app-layout/app-header-layout/app-header-layout.js';
import '@polymer/app-layout/app-toolbar/app-toolbar.js';
import '../scripts/excess-router/excess-router.js';
import '@polymer/iron-ajax/iron-ajax.js';
import '@polymer/iron-flex-layout/iron-flex-layout.js';
import '@polymer/iron-icon/iron-icon.js';
import '@polymer/iron-icons/iron-icons.js';
import '@polymer/iron-icons/notification-icons.js';
import '@polymer/iron-pages/iron-pages.js';
import '@polymer/paper-icon-button/paper-icon-button.js';
import '@polymer/paper-styles/paper-styles.js';
import '../scripts/toast-er/toast-er.js';
import './te-icons.js';
import './te-menu.js';
import './te-theme.js';

Polymer({
  _template: html`
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
      app-drawer-layout:not([narrow]) [drawer-toggle] {
        display: none;
      }
    </style>

    <app-drawer-layout fullbleed="" narrow="{{narrow}}">

      <!-- Drawer content -->
      <app-drawer  slot="drawer">
        <app-toolbar>
          <iron-icon class="logo" src="../images/logo.png"></iron-icon>
          <div class="title">Toilet Evolution</div>
        </app-toolbar>
        <te-menu page="{{page}}" device-id="{{deviceId}}" add-device="{{addDevice}}" selected-title="{{title}}" user="{{currentUser}}"></te-menu>
      </app-drawer>

      <!-- Main content -->
      <app-header-layout has-scrolling-region="">

        <app-header fixed="" condenses="" effects="waterfall" slot="header">
          <app-toolbar>
            <paper-icon-button icon="menu" drawer-toggle></paper-icon-button>
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
  },
  
  ready: function() {
    this.addEventListener('te-device-created', this.reload);
    this.addEventListener('te-device-deleted', this.reload);
    this.addEventListener('excess-route-will-activate', this.routeChange);
  }

});
