import '@polymer/iron-flex-layout/iron-flex-layout.js';
import '@polymer/paper-styles/color.js';
import '@polymer/paper-styles/default-theme.js';
const $_documentContainer = document.createElement('template');

$_documentContainer.innerHTML = `<dom-module id="paper-menu-shared-styles">
  <template>
    <style>
      /* need a wrapper element to make this higher specificity than the :host rule in paper-item */
      .selectable-content > ::content > .iron-selected {
        font-weight: bold;

        @apply(--paper-menu-selected-item);
      }

      .selectable-content > ::content > [disabled] {
        color: var(--paper-menu-disabled-color, --disabled-text-color);
      }

      .selectable-content > ::content > *:focus {
        position: relative;
        outline: 0;

        @apply(--paper-menu-focused-item);
      }

      .selectable-content > ::content > *:focus:after {
        @apply(--layout-fit);
        background: currentColor;
        opacity: var(--dark-divider-opacity);
        content: '';
        pointer-events: none;

        @apply(--paper-menu-focused-item-after);
      }

      .selectable-content > ::content > *[colored]:focus:after {
        opacity: 0.26;
      }
    </style>
  </template>
</dom-module>`;

document.head.appendChild($_documentContainer.content);

/**
@license
Copyright (c) 2015 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/
/*
  FIXME(polymer-modulizer): the above comments were extracted
  from HTML and may be out of place here. Review them and
  then delete this comment!
*/
;
