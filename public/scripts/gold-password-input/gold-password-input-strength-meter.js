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
/* TODO PG: remove this ASAP when https://github.com/PolymerElements/paper-tooltip/issues/121 is fixed */
/*
  FIXME(polymer-modulizer): the above comments were extracted
  from HTML and may be out of place here. Review them and
  then delete this comment!
*/
import '@polymer/polymer/polymer-legacy.js';

import { PaperInputAddonBehavior } from '@polymer/paper-input/paper-input-addon-behavior.js';
import '@polymer/paper-styles/color.js';
import '@polymer/paper-progress/paper-progress.js';
import '@polymer/paper-tooltip/paper-tooltip.js';
import './gold-password-input-icons.js';
import { Polymer } from '@polymer/polymer/lib/legacy/polymer-fn.js';
import 'web-animations-js/web-animations-next-lite.min.js';
const $_documentContainer = document.createElement('template');

$_documentContainer.innerHTML = `<dom-module id="gold-password-input-strength-meter">
  <template>
    <style>
      :host {
        outline: inherit;

        @apply --paper-font-caption;
        @apply --gold-password-input-strength-meter;
      }

      /* FIXME PG: suppress when paper-input-container has reflectToAttribute for invalid... cf. ( https://github.com/PolymerElements/paper-input/pull/258 ) */
      /*
      :host-context([invalid]) {
        visibility: hidden;
      };
      */
      :host([invalid]), :host([warning]) {
        visibility: hidden;
      };

      /* FIXME PG: remove !important used as current workaround before getting the proper explanation... cf. ( https://github.com/Polymer/polymer/issues/3059 )*/
      .None {
        color: var(--gold-password-input-strength-meter-none-color, var(--paper-grey-700)) !important;
        --paper-progress-active-color: var(--gold-password-input-strength-meter-none-color, var(--paper-grey-700)) !important;
      }
      .VeryWeak {
        color: var(--gold-password-input-strength-meter-veryweak-color, var(--paper-red-700)) !important;
        --paper-progress-active-color: var(--gold-password-input-strength-meter-veryweak-color, var(--paper-red-700)) !important;
      }
      .Weak {
        color: var(--gold-password-input-strength-meter-weak-color, var(--paper-orange-700)) !important;
        --paper-progress-active-color: var(--gold-password-input-strength-meter-weak-color, var(--paper-orange-700)) !important;
      }
      .Medium {
        color: var(--gold-password-input-strength-meter-medium-color, var(--paper-yellow-700)) !important;
        --paper-progress-active-color: var(--gold-password-input-strength-meter-medium-color, var(--paper-yellow-700)) !important;
      }
      .Strong {
        color: var(--gold-password-input-strength-meter-strong-color, var(--paper-blue-700)) !important;
        --paper-progress-active-color: var(--gold-password-input-strength-meter-strong-color, var(--paper-blue-700)) !important;
      }
      .VeryStrong {
        color: var(--gold-password-input-strength-meter-verystrong-color, var(--paper-green-700)) !important;
        --paper-progress-active-color: var(--gold-password-input-strength-meter-verystrong-color, var(--paper-green-700)) !important;
      }

      #strengthProgress {
        position: absolute;
        width: 100%;
        height: 2px;
        top: -2.2px;
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

    <paper-progress id="strengthProgress" hidden\$="[[_computeShowProgress(useProgress,_strengthMeterScore)]]" value="[[_computeProgress(_strengthMeterScore)]]" class\$="[[_strengthMeterScoreLabel]]">
    </paper-progress>
    <span id="strengthLabel" hidden\$="[[noLabel]]">
      <iron-icon id="strengthTooltipIcon" icon="gold-password-input:info" hidden\$="[[disableTooltip]]"></iron-icon>
      [[strengthMeterLabels.Label]]:
      <span class\$="[[_strengthMeterScoreLabel]]">[[_computeStrengthMeterLabel(_strengthMeterScoreLabel)]]</span>
      <paper-tooltip id="strengthTooltip" for="strengthTooltipIcon" position="top" offset="4" fit-to-visible-bounds="">
        <div class="warning">
          <span><b>Warning: </b>[[_strengthMeterFeedback.warning]]</span>
        </div>
        <div class="suggestions">
          <span><b>Suggestions: </b>[[_strengthMeterFeedback.suggestions]]</span>
        </div>
      </paper-tooltip>
    </span>

  </template>
  <!-- TODO PG: remove this ASAP when https://github.com/PolymerElements/paper-tooltip/issues/121 is fixed -->
  
  
</dom-module>`;

document.head.appendChild($_documentContainer.content);
var isZxcvbnLoaded = false;

Polymer({
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
     * Contains the current label score value of the input.
     */
    _strengthMeterScoreLabel: {
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
    },
    /**
     * Contains the current score value of the input.
     */
    _strengthMeterScore: {
      type: Number,
      value: 0
    },
    /**
    * Min strength meter score label (used on validate).
    */
    minStrengthMeterScoreLabel: String,
    /**
    * Controls wether the tooltip is rendered or not.
    */
    disableTooltip: Boolean,
    /**
    * Controls whether to use labels to show the strength result.
    */
    noLabel: Boolean,
    /**
    * Controls whether to use a progress bar to show the strength result.
    */
    useProgress: Boolean,
    /**
     * True if a warning is showing.
     */
    warning: {
      reflectToAttribute: true,
      type: Boolean
    },
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
      this._strengthMeterScoreLabel = 'None';
      this._strengthMeterScore = 0;
      this.set('_strengthMeterFeedback.warning', 'None');
      this.set('_strengthMeterFeedback.suggestions', 'None');
      return;
    }

    if (!isZxcvbnLoaded) {
      return;
    }

    // Use zxcvbn to evaluate the strength of the password.
    var result = zxcvbn(state.value);

    // Current score
    this._strengthMeterScore = result.score + 1;

    // update the zxcvbn score property
    switch(this._strengthMeterScore) {
      case 1:
        this._strengthMeterScoreLabel = 'VeryWeak';
        break;
      case 2:
        this._strengthMeterScoreLabel = 'Weak';
        break;
      case 3:
        this._strengthMeterScoreLabel = 'Medium';
        break;
      case 4:
        this._strengthMeterScoreLabel = 'Strong';
        break;
      case 5:
        this._strengthMeterScoreLabel = 'VeryStrong';
        break;
      default:
        this._strengthMeterScoreLabel = 'None';
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

  _computeStrengthMeterLabel: function(_strengthMeterScoreLabel) {
    return this.strengthMeterLabels[_strengthMeterScoreLabel];
  },

  _getStrengthMeterFromLabel(strengthMeterLabel) {
    return Object.keys(this.strengthMeterLabels).find(strengthMeterKey => this.strengthMeterLabels[strengthMeterKey] === strengthMeterLabel);
  },

  _getStrengthMeterScoreFromStrengthMeter(strengthMeter) {
   switch(strengthMeter) {
      case 'VeryWeak':
        return 1;
        break;
      case 'Weak':
        return 2;
        break;
      case 'Medium':
        return 3;
        break;
      case 'Strong':
        return 4;
        break;
      case 'VeryStrong':
        return 5;
        break;
      default:
        return 0;
    }
  },

  _computeShowProgress: function(useProgress, score) {
    return !(useProgress && (score !== 0));
  },

  _computeProgress: function(score) {
    return score * 20;
  },

  validate: function() {
    if (this.minStrengthMeterScoreLabel) {
      const minStrengthMeter = this._getStrengthMeterFromLabel(this.minStrengthMeterScoreLabel);
      const minStrengthMeterScore = this._getStrengthMeterScoreFromStrengthMeter(minStrengthMeter);
      if (this._strengthMeterScore >= minStrengthMeterScore) {
        return true;
      }
      return false;
    }
    return true;
  }
});
