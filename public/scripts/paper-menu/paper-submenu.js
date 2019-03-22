/**
@license
Copyright (c) 2015 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/
/**
`<paper-submenu>` is a nested menu inside of a parent `<paper-menu>`. It
consists of a trigger that expands or collapses another `<paper-menu>`:

    <paper-menu>
      <paper-submenu>
        <paper-item class="menu-trigger">Topics</paper-item>
        <paper-menu class="menu-content">
          <paper-item>Topic 1</paper-item>
          <paper-item>Topic 2</paper-item>
          <paper-item>Topic 3</paper-item>
        </paper-menu>
      </paper-submenu>
      <paper-submenu>
        <paper-item class="menu-trigger">Faves</paper-item>
        <paper-menu class="menu-content">
          <paper-item>Fave 1</paper-item>
          <paper-item>Fave 2</paper-item>
        </paper-menu>
      </paper-submenu>
      <paper-submenu disabled>
        <paper-item class="menu-trigger">Unavailable</paper-item>
        <paper-menu class="menu-content">
          <paper-item>Disabled 1</paper-item>
          <paper-item>Disabled 2</paper-item>
        </paper-menu>
      </paper-submenu>
    </paper-menu>

Just like in `<paper-menu>`, the focused item is highlighted, and the selected
item has bolded text. Please see the `<paper-menu>` docs for which attributes
(such as `multi` and `selected`), and styling options are available for the
`menu-content` menu.

@group Paper Elements
@element paper-submenu
@hero hero.svg
@demo demo/index.html
*/
/*
  FIXME(polymer-modulizer): the above comments were extracted
  from HTML and may be out of place here. Review them and
  then delete this comment!
*/
import '@polymer/polymer/polymer-legacy.js';
import {Polymer} from '@polymer/polymer/lib/legacy/polymer-fn.js';
import {html} from '@polymer/polymer/lib/utils/html-tag.js';
import {dom} from '@polymer/polymer/lib/legacy/polymer.dom.js'
import {IronControlState} from '@polymer/iron-behaviors/iron-control-state.js';
import '@polymer/iron-collapse/iron-collapse.js';
import './paper-menu-shared-styles.js';

Polymer({
  _template: html`
    <style include="paper-menu-shared-styles"></style>

    <div class="selectable-content" on-tap="_onTap">
      <slot id="trigger" name="menu-trigger"></slot>
    </div>
    <iron-collapse id="collapse" opened="{{opened}}">
      <slot id="content" name="menu-content"></slot>
    </iron-collapse>
    <slot></slot>
`,

  is: 'paper-submenu',

  properties: {
    /**
     * Fired when the submenu is opened.
     *
     * @event paper-submenu-open
     */

    /**
     * Fired when the submenu is closed.
     *
     * @event paper-submenu-close
     */

    /**
     * Set opened to true to show the collapse element and to false to hide it.
     *
     * @attribute opened
     */
    opened: {
      type: Boolean,
      value: false,
      notify: true,
      observer: '_openedChanged'
    }
  },

  behaviors: [
    IronControlState
  ],

  listeners: {
    'focus': '_onFocus'
  },

  get __parent() {
    return dom(this).parentNode;
  },

  get __trigger() {
    return dom(this.$.trigger).getDistributedNodes()[0];
  },

  get __content() {
    return dom(this.$.content).getDistributedNodes()[0];
  },

  attached: function() {
    this.listen(this.__parent, 'iron-activate', '_onParentIronActivate');
  },

  detached: function() {
    this.unlisten(this.__parent, 'iron-activate', '_onParentIronActivate');
  },

  /**
   * Expand the submenu content.
   */
  open: function() {
    if (!this.disabled) {
      this.opened = true;
    }
  },

  /**
   * Collapse the submenu content.
   */
  close: function() {
    this.opened = false;
  },

  /**
   * Toggle the submenu.
   */
  toggle: function() {
    if (this.opened) {
      this.close();
    } else {
      this.open();
    }
  },

  /**
   * A handler that is called when the trigger is tapped.
   */
  _onTap: function(e) {
    if (!this.disabled) {
      this.toggle();
    }
  },

  /**
   * Toggles the submenu content when the trigger is tapped.
   */
  _openedChanged: function(opened, oldOpened) {
    if (opened) {
      this.__trigger && this.__trigger.classList.add('iron-selected');
      this.__content && this.__content.focus();
      this.fire('paper-submenu-open');
    } else if (oldOpened != null) {
      this.__trigger && this.__trigger.classList.remove('iron-selected');
      this.fire('paper-submenu-close');
    }
  },

  /**
   * A handler that is called when `iron-activate` is fired.
   *
   * @param {CustomEvent} event An `iron-activate` event.
   */
  _onParentIronActivate: function(event) {
    var parent = this.__parent;
    if (dom(event).localTarget === parent) {
      // The activated item can either be this submenu, in which case it
      // should be expanded, or any of the other sibling submenus, in which
      // case this submenu should be collapsed.
      if (event.detail.item !== this && !parent.multi) {
        this.close();
      }
    }
  },

  /**
   * If the dropdown is open when disabled becomes true, close the
   * dropdown.
   *
   * @param {boolean} disabled True if disabled, otherwise false.
   */
  _disabledChanged: function(disabled) {
    IronControlState._disabledChanged.apply(this, arguments);
    if (disabled && this.opened) {
      this.close();
    }
  },

  /**
   * Handler that is called when the menu receives focus.
   *
   * @param {FocusEvent} event A focus event.
   */
  _onFocus: function(event) {
    this.__trigger && this.__trigger.focus();
  }
});
