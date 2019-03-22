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
Material design: [Menus](https://www.google.com/design/spec/components/menus.html)

`<paper-menu>` implements an accessible menu control with Material Design styling. The focused item
is highlighted, and the selected item has bolded text.

    <paper-menu>
      <paper-item>Item 1</paper-item>
      <paper-item>Item 2</paper-item>
    </paper-menu>

An initial selection can be specified with the `selected` attribute.

    <paper-menu selected="0">
      <paper-item>Item 1</paper-item>
      <paper-item>Item 2</paper-item>
    </paper-menu>

Make a multi-select menu with the `multi` attribute. Items in a multi-select menu can be deselected,
and multiple items can be selected.

    <paper-menu multi>
      <paper-item>Item 1</paper-item>
      <paper-item>Item 2</paper-item>
    </paper-menu>

### Styling

The following custom properties and mixins are available for styling:

Custom property | Description | Default
----------------|-------------|----------
`--paper-menu-background-color`   | Menu background color                                            | `--primary-background-color`
`--paper-menu-color`              | Menu foreground color                                            | `--primary-text-color`
`--paper-menu-disabled-color`     | Foreground color for a disabled item                             | `--disabled-text-color`
`--paper-menu`                    | Mixin applied to the menu                                        | `{}`
`--paper-menu-selected-item`      | Mixin applied to the selected item                               | `{}`
`--paper-menu-focused-item`       | Mixin applied to the focused item                                | `{}`
`--paper-menu-focused-item-after` | Mixin applied to the ::after pseudo-element for the focused item | `{}`

### Accessibility

`<paper-menu>` has `role="menu"` by default. A multi-select menu will also have
`aria-multiselectable` set. It implements key bindings to navigate through the menu with the up and
down arrow keys, esc to exit the menu, and enter to activate a menu item. Typing the first letter
of a menu item will also focus it.

@group Paper Elements
@element paper-menu
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
import {IronMenuBehavior} from '@polymer/iron-menu-behavior/iron-menu-behavior.js';
import '@polymer/paper-styles/default-theme.js';
import './paper-menu-shared-styles.js';
Polymer({
  _template: html`
    <style include="paper-menu-shared-styles"></style>
    <style>
      :host {
        display: block;
        padding: 8px 0;

        background: var(--paper-menu-background-color, --primary-background-color);
        color: var(--paper-menu-color, --primary-text-color);

        @apply(--paper-menu);
      }
    </style>

    <div class="selectable-content">
      <slot></slot>
    </div>
`,

  is: 'paper-menu',

  behaviors: [
    IronMenuBehavior
  ]
});
