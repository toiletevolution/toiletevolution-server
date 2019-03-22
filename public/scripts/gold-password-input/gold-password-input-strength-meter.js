/*
`<gold-password-input-strength-meter>` is a password strength meter for use with
`<gold-password-input>`. It shows the strength of the password entered in the input.

### Styling

The following mixin is available for styling:

Custom property | Description | Default
----------------|-------------|----------
`--gold-password-input-strength-meter-none-color` | The text color for a strength value of None  | `--paper-red-700`
`--gold-password-input-strength-meter-veryweak-color` | The text color for a strength value of Very Weak  | `--paper-red-700`
`--gold-password-input-strength-meter-weak-color` | The text color for a strength value of Weak  | `--paper-orange-700`
`--gold-password-input-strength-meter-medium-color` | The text color for a strength value of Medium  | `--paper-yellow-700`
`--gold-password-input-strength-meter-strong-color` | The text color for a strength value of Strong  | `--paper-blue-700`
`--gold-password-input-strength-meter-verystrong-color` | The text color for a strength value of Very Strong  | `--paper-green-700`
`--gold-password-input-strength-meter` | Mixin applied to the element | `{}`
*/
/*
  FIXME(polymer-modulizer): the above comments were extracted
  from HTML and may be out of place here. Review them and
  then delete this comment!
*/
import '@polymer/polymer/polymer-legacy.js';
import {Polymer} from '@polymer/polymer/lib/legacy/polymer-fn.js';
import {html} from '@polymer/polymer/lib/utils/html-tag.js';

import '@polymer/iron-icon/iron-icon.js';
import '@polymer/paper-styles/color.js';
import {PaperInputAddonBehavior} from '@polymer/paper-input/paper-input-addon-behavior.js';
import '@polymer/paper-tooltip/paper-tooltip.js';
import './gold-password-input-icons.js';
var isZxcvbnLoaded = false;

Polymer({
  _template: html`
    <style>
      :host {
        float: right;

        @apply --paper-font-caption;
        @apply --gold-password-input-strength-meter;
      }

      :host-context([dir="rtl"]) {
        float: left;
      }
      /* FIXME PG: suppress when paper-input-container has reflectToAttribute for invalid... cf. ( https://github.com/PolymerElements/paper-input/pull/258 ) */
/*
      :host-context([invalid]) {
        visibility: hidden;
      };
*/
      :host([invalid]) {
        visibility: hidden;
      };

      /* FIXME PG: remove !important used as current workaround before getting the proper explanation... cf. ( https://github.com/Polymer/polymer/issues/3059 )*/
      .None {
        color: var(--gold-password-input-strength-meter-none-color, --paper-grey-700) !important;
      }
      .VeryWeak {
        color: var(--gold-password-input-strength-meter-veryweak-color, --paper-red-700) !important;
      }
      .Weak {
        color: var(--gold-password-input-strength-meter-weak-color, --paper-orange-700) !important;
      }
      .Medium {
        color: var(--gold-password-input-strength-meter-medium-color, --paper-yellow-700) !important;
      }
      .Strong {
        color: var(--gold-password-input-strength-meter-strong-color, --paper-blue-700) !important;
      }
      .VeryStrong {
        color: var(--gold-password-input-strength-meter-verystrong-color, --paper-green-700) !important;
      }

      #strengthLabel iron-icon {
        width: 14px;
        height: 14px;
        padding-bottom: 3px;
        color: var(--paper-grey-700);
      };

      #strengthTooltip * {
        display: block;
        color: white !important;
      };
    </style>

    <span id="strengthLabel">
      [[strengthMeterLabels.Label]]:
      <span class\$="[[_strengthMeterScore]]">[[_computeStrengthMeterLabel(_strengthMeterScore)]]</span>
      <iron-icon icon="gold-password-input:info"></iron-icon>
    </span>
    <paper-tooltip id="strengthTooltip" for="strengthLabel" position="bottom" offset="14">
      <div class="warning">
        <span><b>Warning: </b>[[_strengthMeterFeedback.warning]]</span>
      </div>
      <div class="suggestions">
        <span><b>Suggestions: </b>[[_strengthMeterFeedback.suggestions]]</span>
      </div>
    </paper-tooltip>
`,

  is: 'gold-password-input-strength-meter',

  behaviors: [
    PaperInputAddonBehavior
  ],

  properties: {
    /**
     * Specifies the label to be used to display the score to the user.
     */
    strengthMeterLabels: {
      type: Object,
      value: function() { return {
        Label: "Strength",
        None: "None",
        VeryWeak: "Very Weak",
        Weak: "Weak",
        Medium: "Medium",
        Strong: "Strong",
        VeryStrong: "Very Strong"};
      }
    },
    // FIXME PG: suppress when paper-input-container has reflectToAttribute for invalid... cf. ( https://github.com/PolymerElements/paper-input/pull/258 )
    /**
     * True if the error is showing.
     */
    invalid: {
      readOnly: true,
      reflectToAttribute: true,
      type: Boolean
    },
    /**
     * Contains the current score value of the input.
     */
    _strengthMeterScore: {
      type: String,
      value: 'None'
    },
    /**
     * Provides additional hints (Warning and Suggestions) to help a user strengthen its password
     */
    _strengthMeterFeedback: {
      type: Object,
      value: function() { return {
        warning: 'None',
        suggestions: 'None'};
      }
    }
  },

  ready: function() {
    isZxcvbnLoaded = typeof zxcvbn !== "undefined";
    if (!isZxcvbnLoaded) {
      isZxcvbnLoaded = true;
      var oScript = document.createElement("script");
      oScript.type = "text\/javascript";
      oScript.onerror = function(err) {
        isZxcvbnLoaded = false;
        throw new URIError("The script " + err.target.src + " is not accessible.");
      };
      this.parentNode.insertBefore(oScript, this);
      oScript.src = this.resolveUrl("../zxcvbn/dist/zxcvbn.js");
    }
  },

  update: function(state) {
    // FIXME PG: suppress when paper-input-container has reflectToAttribute for invalid... cf. ( https://github.com/PolymerElements/paper-input/pull/258 )
    this._setInvalid(state.invalid);

    if (!state.inputElement) {
      return;
    }

    state.value = state.value || '';
    if (state.value === '') {
      this._strengthMeterScore = 'None';
      this.set('_strengthMeterFeedback.warning', 'None');
      this.set('_strengthMeterFeedback.suggestions', 'None');
      return;
    }

    if (!isZxcvbnLoaded) {
      return;
    }

    // Use zxcvbn to evaluate the strength of the password.
    var result = zxcvbn(state.value);

    // update the zxcvbn score property
    switch(result.score) {
      case 0:
        this._strengthMeterScore = 'VeryWeak';
        break;
      case 1:
        this._strengthMeterScore = 'Weak';
        break;
      case 2:
        this._strengthMeterScore = 'Medium';
        break;
      case 3:
        this._strengthMeterScore = 'Strong';
        break;
      case 4:
        this._strengthMeterScore = 'VeryStrong';
        break;
      default:
        this._strengthMeterScore = 'None';
    }

    // update the user feedback if any
    this._strengthMeterFeedback = result.feedback;
    if (this._strengthMeterFeedback.warning === "") {
      this.set('_strengthMeterFeedback.warning', 'None');
    }
    if (this._strengthMeterFeedback.suggestions.length === 0) {
      this.set('_strengthMeterFeedback.suggestions', 'None');
    }
  },

  _computeStrengthMeterLabel: function(_strengthMeterScore) {
    return this.strengthMeterLabels[_strengthMeterScore];
  }
});
