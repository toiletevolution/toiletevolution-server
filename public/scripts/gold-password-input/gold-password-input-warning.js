/*
`<gold-password-input-warning>` is a warning add-on to use with `<paper-input-container>`. The warning is
displayed when a warning message needs to be displayed.

### Styling

The following custom properties and mixins are available for styling:

Custom property | Description | Default
----------------|-------------|----------
`--gold-password-input-warning-color` | The foreground color of the error | `--paper-amber-a700`
`--gold-password-input-warning`                   | Mixin applied to the error        | `{}`
*/
/*
  FIXME(polymer-modulizer): the above comments were extracted
  from HTML and may be out of place here. Review them and
  then delete this comment!
*/
import '@polymer/polymer/polymer-legacy.js';

import '@polymer/paper-styles/default-theme.js';
import '@polymer/paper-styles/typography.js';
import { PaperInputAddonBehavior } from '@polymer/paper-input/paper-input-addon-behavior.js';
import { Polymer } from '@polymer/polymer/lib/legacy/polymer-fn.js';
import { html } from '@polymer/polymer/lib/utils/html-tag.js';
Polymer({
  _template: html`
    <style>
      :host {
        display: inline-block;
        visibility: hidden;

        color: var(--gold-password-input-warning-color, var(--paper-amber-a700));

        @apply --paper-font-caption;
        @apply --gold-password-input-warning;
        position: absolute;
        left:0;
        right:0;
      }

      :host([warning]) {
        visibility: visible;
      };
    </style>

    <slot></slot>
`,

  is: 'gold-password-input-warning',

  behaviors: [
    PaperInputAddonBehavior
  ],

  properties: {
    /**
     * True if the error is showing.
     */
    warning: {
      reflectToAttribute: true,
      notify: true,
      type: Boolean
    }
  },

  /**
   * This overrides the update function in PaperInputAddonBehavior.
   * @param {{
   *   inputElement: (Element|undefined),
   *   value: (string|undefined),
   *   invalid: boolean
   * }} state -
   *     inputElement: The input element.
   *     value: The input value.
   *     invalid: True if the input value is invalid.
   */
  update: function(state) {
    state.value = state.value || '';
    if (state.value === '') {
      this.warning = false;
    }
}
});
