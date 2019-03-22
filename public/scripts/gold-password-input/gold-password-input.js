/* FIXME PG: remove the import when the corresponding issue is fixed:
(https://github.com/PolymerElements/iron-component-page/issues/34) */
/**
`<gold-password-input>` is a single-line text field with Material Design styling
for entering a password.

    <gold-password-input></gold-password-input>

It may include a Strength Meter based on [zxcvbn](https://github.com/dropbox/zxcvbn)

    <gold-password-input strength-meter></gold-password-input>

***Note**: You need to add the dependency to the `polymer.json` configuration file like follow:
    
    "includeDependencies": [ "bower_components/zxcvbn/dist/zxcvbn.js" ]

It may include an optional label, which by default is "Password".

    <gold-password-input label="Account Password"></gold-password-input>

It may include a reveal option to be able to show the plain text password with a toggle icon.

    <gold-password-input reveal></gold-password-input>

It may include an optional label configuration object.

    <gold-password-input
      strength-meter
      strength-meter-labels='{
        "Label": "Love",
        "None": "Nature",
        "VeryWeak": "VolksWagen",
        "Weak": "Winner",
        "Medium": "Meow",
        "Strong": "Superman",
        "VeryStrong": "VerSus"}'>
    </gold-password-input>

See `Polymer.PaperInputBehavior` for more API docs.

### Validation

It may include a minlength and maxlength to restrict the length of the password

    <gold-password-input minlength="6" maxlength="24"></gold-password-input>

It may include a validator as specified in `Polymer.PaperInputBehavior`

    <gold-password-input-validator pattern="[a-ZA-Z0-9]*"><gold-password-input-validator>
    <gold-password-input validator="gold-input-password-validator"></gold-password-input>

The input can be automatically validated as the user is typing by using
the `auto-validate` and `required` attributes. For manual validation, the
element also has a `validate()` method, which returns the validity of the
input as well as sets any appropriate error messages and styles.

See `Polymer.PaperInputBehavior` for more API docs.

### Styling

See `Polymer.PaperInputContainer` for a list of custom properties used to
style this element.

@group Gold Elements
@element gold-password-input
@hero hero.svg
@demo demo/index.html Standard Demo
@demo demo/noloading.html No zxcvbn loading
*/
/*
  FIXME(polymer-modulizer): the above comments were extracted
  from HTML and may be out of place here. Review them and
  then delete this comment!
*/
import '@polymer/polymer/polymer-legacy.js';
import {Polymer} from '@polymer/polymer/lib/legacy/polymer-fn.js';
import {html} from '@polymer/polymer/lib/utils/html-tag.js';
import '@polymer/iron-input/iron-input.js';
import {IronFormElementBehavior} from '@polymer/iron-form-element-behavior/iron-form-element-behavior.js';
import {PaperInputBehavior} from '@polymer/paper-input/paper-input-behavior.js';
import '@polymer/paper-input/paper-input-container.js';
import '@polymer/paper-input/paper-input-error.js';
import 'polymer-toggle-icon/toggle-icon.js';
import './gold-password-input-icons.js';
import './gold-password-input-strength-meter.js';
import './gold-password-input-validator.js';
Polymer({
  _template: html`
    <style>
      :host {
        display: block;
      }

      toggle-icon {
        color: gray;
        --paper-icon-button: {
          padding: 2px;
          width: 26px;
          height: 26px;
        };
      }
    </style>

    <paper-input-container id="container" disabled\$="[[disabled]]" invalid="[[invalid]]" no-label-float="[[noLabelFloat]]" always-float-label="[[_computeAlwaysFloatLabel(alwaysFloatLabel,placeholder)]]" auto-validate\$="[[autoValidate]]">

      <label hidden\$="[[!label]]">[[label]]</label>

      <input is="iron-input" id="input" bind-value="{{value}}" disabled\$="[[disabled]]" invalid="{{invalid}}" validator="[[validator]]" type="password" required\$="[[required]]" autocomplete\$="[[autocomplete]]" autofocus\$="[[autofocus]]" inputmode\$="[[inputmode]]" minlength\$="[[minlength]]" maxlength\$="[[maxlength]]" name\$="[[name]]" placeholder\$="[[placeholder]]" readonly\$="[[readonly]]" size\$="[[size]]" autocapitalize\$="[[autocapitalize]]" autocorrect\$="[[autocorrect]]" aria-labelledby\$="[[_ariaLabelledBy]]" aria-describedby\$="[[_ariaDescribedBy]]">

      <toggle-icon suffix\$="[[suffix]]" prefix\$="[[prefix]]" noink="" id="reveal" icon="gold-password-input:visibility" icon-checked="gold-password-input:visibility-off" hidden\$="[[!reveal]]" checked="{{_checked}}" animation="flip-horizontal">
      </toggle-icon>

      <template is="dom-if" if="[[errorMessage]]">
        <paper-input-error id="error">[[errorMessage]]</paper-input-error>
      </template>

      <template is="dom-if" if="[[strengthMeter]]">
        <gold-password-input-strength-meter id="strength" strength-meter-labels="[[strengthMeterLabels]]">
        </gold-password-input-strength-meter>
      </template>

    </paper-input-container>
`,

  is: 'gold-password-input',

  behaviors: [
    IronFormElementBehavior,
    PaperInputBehavior
  ],

  properties: {
    /**
     * Set to true to show a strength meter.
     */
    strengthMeter: {
      type: Boolean,
      value: false
    },
    /**
     * Specifies the optional alternative labels to display for the strength meter.
     */
    strengthMeterLabels: {
      type: Object
    },
    /**
     * Set to true to show a reveal password icon.
     */
    reveal: {
      type: Boolean,
      value: false
    },
    /**
     * Set to true to show the icon before the password field.
     */
    prefix: {
      type: Boolean,
      value: false
    },
    /**
     * Set to true to show the icon after the password field.
     */
    suffix: {
      type: Boolean,
      value: false
    },
    /**
     * State of the reveal icon.
     */
    _checked: {
      type: Boolean,
      observer: '_checkedChanged'
    }
  },

  ready: function() {
    if (!this.label) {
      this.label = "Password";
    }
    if (this.reveal && !this.prefix && !this.suffix) {
      this.suffix = true;
    }
    if (this.suffix && this.prefix) {
      this.prefix = false;
    }
  },

  attached: function() {
    // this prevent tabbing issue since paperInputBehavior is forcing focus on input element...
    this.$.reveal.$.checked.tabIndex = -1;
    this.$.reveal.$.unchecked.tabIndex = -1;
  },

  _checkedChanged: function(checked) {
    if (checked) {
      this.$.input.type = "text";
    } else {
      this.$.input.type = "password";
    }
  }
});
