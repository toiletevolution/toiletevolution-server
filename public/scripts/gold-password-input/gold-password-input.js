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

The strength could be represented as string label (default), but also as a progress bar using the use-progress option.

Eventually, one may also warn a user with Caps Lock ON detection.

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

import '@polymer/iron-input/iron-input.js';
import { IronFormElementBehavior } from '@polymer/iron-form-element-behavior/iron-form-element-behavior.js';
import '@polymer/iron-flex-layout/iron-flex-layout.js';
import { PaperInputBehavior } from '@polymer/paper-input/paper-input-behavior.js';
import '@polymer/paper-input/paper-input-container.js';
import '@polymer/paper-input/paper-input-error.js';
import 'polymer-toggle-icon/toggle-icon.js';
import './gold-password-input-icons.js';
import './gold-password-input-strength-meter.js';
import './gold-password-input-warning.js';
import './gold-password-input-validator.js';
import { Polymer } from '@polymer/polymer/lib/legacy/polymer-fn.js';
import { DomModule } from '@polymer/polymer/lib/elements/dom-module.js';
import { PolymerElement } from '@polymer/polymer/polymer-element.js';
import { beforeNextRender } from '@polymer/polymer/lib/utils/render-status.js';
const $_documentContainer = document.createElement('template');

$_documentContainer.innerHTML = `<dom-module id="gold-password-input">
  <template>
    <style>
      :host {
        display: block;
      }

      /* TODO: This should be a dropdown */
      span {
        @apply --paper-font-subhead;
        @apply --paper-input-container-input;
      }

      input {
        @apply --layout-flex;
      }
      input
      {
        position: relative; /* to make a stacking context */
        outline: none;
        box-shadow: none;
        padding: 0;
        width: 100%;
        max-width: 100%;
        background: transparent;
        border: none;
        color: var(--paper-input-container-input-color, var(--primary-text-color));
        -webkit-appearance: none;
        text-align: inherit;
        vertical-align: bottom;
        /* Firefox sets a min-width on the input, which can cause layout issues */
        min-width: 0;
        @apply --paper-font-subhead;
        @apply --paper-input-container-input;
      }
      input::-webkit-input-placeholder {
        color: var(--paper-input-container-color, var(--secondary-text-color));
      }
      input:-moz-placeholder {
        color: var(--paper-input-container-color, var(--secondary-text-color));
      }
      input::-moz-placeholder {
        color: var(--paper-input-container-color, var(--secondary-text-color));
      }
      input:-ms-input-placeholder {
        color: var(--paper-input-container-color, var(--secondary-text-color));
      }

      toggle-icon {
        color: gray;
        width: 24px;
        height: 24px;
        --paper-icon-button: {
          padding: 0px;
          width: 24px;
          height: 24px;
        };
      }
    </style>

    <paper-input-container id="container" disabled\$="[[disabled]]" no-label-float="[[noLabelFloat]]" always-float-label="[[_computeAlwaysFloatLabel(alwaysFloatLabel,placeholder)]]" invalid="[[invalid]]" auto-validate\$="[[autoValidate]]">

      <label slot="label" hidden\$="[[!label]]">[[label]]</label>

      <span id="template-placeholder"></span>

      <template is="dom-if" if="[[prefix]]">
        <toggle-icon slot="prefix" noink="" id="reveal" icon="gold-password-input:visibility" icon-checked="gold-password-input:visibility-off" hidden\$="[[!reveal]]" checked="{{_checked}}" animation="flip-horizontal">
        </toggle-icon>
      </template>
      <template is="dom-if" if="[[suffix]]">
        <toggle-icon slot="suffix" noink="" id="reveal" icon="gold-password-input:visibility" icon-checked="gold-password-input:visibility-off" hidden\$="[[!reveal]]" checked="{{_checked}}" animation="flip-horizontal">
        </toggle-icon>
      </template>

      <div slot="add-on">
        <template is="dom-if" if="[[errorMessage]]">
          <paper-input-error id="error">[[errorMessage]]</paper-input-error>
        </template>

        <template is="dom-if" if="[[warnCapsLock]]">
          <gold-password-input-warning id="warning" warning="{{_isCapsLock}}">
            Caps Lock is currently on.
          </gold-password-input-warning>
        </template>

        <template is="dom-if" if="[[strengthMeter]]">
          <gold-password-input-strength-meter id="strength" strength-meter-labels="[[strengthMeterLabels]]" min-strength-meter-score-label="[[minStrengthMeterScoreLabel]]" no-label="[[noLabel]]" use-progress="[[useProgress]]" disable-tooltip="[[disableTooltip]]" warning="{{_computeWarning(warnCapsLock,_isCapsLock)}}">
          </gold-password-input-strength-meter>
        </template>
      </div>

    </paper-input-container>
  </template>

  <template id="v0">
      <input is="iron-input" id="input" slot="input" value="{{value::input}}" aria-labelledby\$="[[_ariaLabelledBy]]" aria-describedby\$="[[_ariaDescribedBy]]" required\$="[[required]]" bind-value="{{value}}" name\$="[[name]]" autocomplete\$="[[autocomplete]]" type="password" disabled\$="[[disabled]]" invalid="{{invalid}}" autofocus\$="[[autofocus]]" inputmode\$="[[inputmode]]" placeholder\$="[[placeholder]]" validator="[[validator]]" readonly\$="[[readonly]]" minlength\$="[[minlength]]" maxlength\$="[[maxlength]]" size\$="[[size]]" autocapitalize\$="[[autocapitalize]]" autocorrect\$="[[autocorrect]]">
  </template>

  <template id="v1">
      <iron-input id="input" slot="input" bind-value\$="{{value}}" validator="[[validator]]" invalid\$="{{invalid}}">
        <input id="nativeInput" value="{{value::input}}" aria-labelledby\$="[[_ariaLabelledBy]]" aria-describedby\$="[[_ariaDescribedBy]]" required\$="[[required]]" name\$="[[name]]" autocomplete\$="[[autocomplete]]" type="password" disabled\$="[[disabled]]" autofocus\$="[[autofocus]]" inputmode\$="[[inputmode]]" placeholder\$="[[placeholder]]" readonly\$="[[readonly]]" minlength\$="[[minlength]]" maxlength\$="[[maxlength]]" size\$="[[size]]" autocapitalize\$="[[autocapitalize]]" autocorrect\$="[[autocorrect]]">
      </iron-input>
  </template>


</dom-module>`;

document.head.appendChild($_documentContainer.content);
Polymer({
  is: 'gold-password-input',

  behaviors: [
    IronFormElementBehavior,
    PaperInputBehavior
  ],

  properties: {
    /**
    * The label for this input.
    */
    label: {
      type: String,
      value: 'Password'
    },

    value: {
      type: String,
      observer: '_onValueChanged'
    },
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
    },
    /**
     * Min strength meter score label (used on validate).
     */
    minStrengthMeterScoreLabel: String,
    /**
    * Controls whether the tooltip is rendered or not.
    */
    disableTooltip: {
      type: Boolean,
      value: false
    },
    /**
    * Controls whether not to use labels to show the strength result.
    */
    noLabel: {
      type: Boolean,
      value: false
    },
    /**
    * Controls whether to use a progress bar to show the strength result.
    */
    useProgress: {
      type: Boolean,
      value: false
    },
    /**
    * Controls whether to show a warning when Caps Lock is on.
    */
    warnCapsLock: {
      type: Boolean,
      value: false
    },
    /**
    * Internal value reflecting the Caps Lock state.
    */
    _isCapsLock: {
      type: Boolean,
      notify: true,
      value: false
    }
  },

  beforeRegister: function() {
    var template = DomModule.import('gold-password-input', 'template');
    var version = PolymerElement ? 'v1' : 'v0';
    var inputTemplate = DomModule.import('gold-password-input', 'template#' + version);
    var inputPlaceholder = template.content.querySelector('#template-placeholder');
    if (inputPlaceholder) {
      inputPlaceholder.parentNode.replaceChild(inputTemplate.content, inputPlaceholder);
    }
  },

  validate() {
    let strengthValidation = true;
    if (this.strengthMeter && this.minStrengthMeterScoreLabel) {
      strengthValidation = this.shadowRoot.querySelector('gold-password-input-strength-meter').validate();
    }
    if (strengthValidation && PaperInputBehavior[2].validate.bind(this)()) {
      this.invalid = false;
      return true;
    }
    this.invalid = true;
    return false;
  },

  /**
  * Returns a reference to the focusable element. Overridden from PaperInputBehavior
  * to correctly focus the native input.
  */
  get _focusableElement() {
    return PolymerElement ? this.inputElement._inputElement : this.inputElement;
  },

  // Note: This event is only available in the 2.0 version of this element.
  // In 1.0, the functionality of `_onIronInputReady` is done in
  // PaperInputBehavior::attached.
  listeners: {
    'iron-input-ready': '_onIronInputReady'
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
    if (this.value && !PolymerElement) {
      this._handleAutoValidate();
    }
    this.addEventListener('keypress', this._checkCapsLock)
  },

  _onIronInputReady: function() {
    // Only validate when attached if the input already has a value.
    if (!!this.inputElement.bindValue) {
      this._handleAutoValidate();
    // Assign an empty string value if no value so if it becomes time
    // to validate it is not undefined.
    } else {
      this.value = '';
    }
  },

  attached: function() {
    beforeNextRender(this, function() {
      // this prevent tabbing issue since paperInputBehavior is forcing focus on input element...
      if (this.reveal) {
        let revealElement = this.shadowRoot.querySelector('#reveal')
        revealElement.$.unchecked.tabIndex = -1;
        revealElement.$.checked.tabIndex = -1;
      }
    });
  },

  _checkedChanged: function(checked) {
    if (checked) {
      this.$.input.type = "text";
      this.$.nativeInput.type = "text";
    } else {
      this.$.input.type = "password";
      this.$.nativeInput.type = "password";
    }
  },

  /**
  * A handler that is called on input
  */
  _onValueChanged: function(value, oldValue) {
    this.invalid = false;
    // The initial property assignment is handled by `ready`.
    if (oldValue == undefined || value === oldValue)
      return;

    //Ensure value is a string
    value = value ? value.toString() : '';

    // Note: this will call _onValueChanged again, which will move the
    // cursor to the end of the value. Correctly adjust the caret afterwards.
    this.updateValueAndPreserveCaret(value.trim());

    this._handleAutoValidate();
  },

  _checkCapsLock: function(e) {
    var myKeyCode = e.which ? e.which : ( e.keyCode ? e.keyCode : ( e.charCode ? e.charCode : 0 ) );
    var myShiftKey = e.shiftKey || ( e.modifiers && ( e.modifiers & 4 ) );
    var charStr = String.fromCharCode(myKeyCode);
    if ( (charStr.toUpperCase() == charStr ) && ( charStr.toLowerCase() != charStr ) && !myShiftKey ) {
      this._isCapsLock = true
    } else {
      this._isCapsLock = false
    }
  },

  _computeWarning: function(warnCapsLock, isCapsLock) {
    return warnCapsLock && isCapsLock
  }
});
