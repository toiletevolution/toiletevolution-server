/*
`<gold-password-input-validator>` is a validator used to validate a password in
combination with a `<gold-password-input>`.

    <gold-password-input-validator pattern="[a-ZA-Z0-9]*"><gold-password-input-validator>

The given pattern will be used to check the value of the password against.
*/
/*
  FIXME(polymer-modulizer): the above comments were extracted
  from HTML and may be out of place here. Review them and
  then delete this comment!
*/
import '@polymer/polymer/polymer-legacy.js';
import {Polymer} from '@polymer/polymer/lib/legacy/polymer-fn.js';

import {IronValidatorBehavior} from '@polymer/iron-validator-behavior/iron-validator-behavior.js';
Polymer({
  is: 'gold-password-input-validator',

  behaviors: [
    IronValidatorBehavior
  ],

  properties: {
    /**
     * Regexp to validate the value against
     */
    pattern: {
      type: String,
      value: '.*'
    }
  },

  validate: function(value) {
    var regexp = new RegExp("^" + this.pattern + "$");
    return !value || (value.match(regexp) !== null);
  }
});
