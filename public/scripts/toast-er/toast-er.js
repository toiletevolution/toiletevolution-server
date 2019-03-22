/**
@license
Copyright 2015 Mason Louchart

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/
/**
Polymer toaster with some swagg features.

The toaster has a bin. So you can throw events without caring about
displaying, all messages will be displayed with respecting of each individual
configuration (text, duration, style, position...).

The toaster makes 4 types of toast (info, success, warning and error). Each
type sets a light at the bottom according to the level of 'dangerousity'.

You can also set the heat level (low, middle or high). The toast blink more or
less speedily according to the defined level.

You can choose on which shelf placing the toaster. There are 4 possibilities of
course, the shelf at bottom-left (default), bottom-right, top-left and
top-right.
<br>

###Example:
Just put the tag in the index page...

    <toast-er></toast-er>
    <toast-er duration="5000"></toast-er>
    <toast-er type="info"></toast-er>
    <toast-er type="warning" heat="middle"></toast-er>
    <toast-er shelf="top-right"></toast-er>

...and fire some events, that's all !

    <script>
    function someMethod() {
      this.fire('iron-signal', {
        name: 'toaster-bake',
        data: {
          text: 'You are not allowed to do this.',
          type: 'error',
          duration: 5000,
          heat: 'high',
          shelf: 'top-right'
        }
      });
    }
    </script>

There are no required options excepted `text` !
<br><br>

##Audited events:

Name                        | Method called | Description
:---------------------------|:--------------|:-----------
`iron-signal-toaster-bake`  | `_bake`       | Shows the toast with received data
<br>

##Event detail properties:

Property   | Value           | Description
:----------|:----------------|:------------
`text`     | 'What you want' | The text shown by the toaster
`type`     | 'info'          | Sets the color of toaster bottom to #00baff (cyan)
`type`     | 'success'       | Sets the color of toaster bottom to #0bdb00 (green)
`type`     | 'warning'       | Sets the color of toaster bottom to #ffa800 (orange)
`type`     | 'error'         | Sets the color of toaster bottom to #fb0000 (red)
`duration` | 5000 (millisec) | Sets the toast duration to 5 seconds (default: 3000)
`heat`     | 'low'           | The toaster blinks with a transition in 3 seconds
`heat`     | 'middle'        | The toaster blinks with a transition in 2 seconds
`heat`     | 'high'          | The toaster blinks with a transition in 1 second
`shelf`    | 'top-right'     | Sets the toaster position to the top-right corner
`shelf`    | 'top-left'      | Sets the toaster position to the top-left corner
`shelf`    | 'bottom-right'  | Sets the toaster position to the bottom-right corner
`shelf`    | 'bottom-left'   | Sets the toaster position to the bottom-left corner

@element toast-er
@demo
@demo https://LM450N.github.io/toast-er/components/toast-er/demo/
@blurb Polymer toast with some extra features.
@homepage https://LM450N.github.io/toast-er/components/toast-er/
*/
/*
  FIXME(polymer-modulizer): the above comments were extracted
  from HTML and may be out of place here. Review them and
  then delete this comment!
*/
import '@polymer/polymer/polymer-legacy.js';
import {Polymer} from '@polymer/polymer/lib/legacy/polymer-fn.js';

import '@polymer/paper-toast/paper-toast.js';
import '../iron-signals/iron-signals.js';
const $_documentContainer = document.createElement('template');

$_documentContainer.innerHTML = `<dom-module id="toast-er">
  <style>
  :host {
    display: inline-block;
    box-sizing: border-box;
    position: fixed;
  }
  #grill {
    position: absolute;
    bottom: 0px;
    left: 0px;
    height: 5px;
    width: 100%;
  }
  .info {
    background-color: rgb(0, 186, 255);
  }
  .success {
    background-color: rgb(11, 219, 0);
  }
  .warning {
    background-color: rgb(255, 168, 0);
  }
  .error {
    background-color: rgb(251, 0, 0);
  }
  @-webkit-keyframes cooking {
    from {
      opacity: 1;
    }
    50% {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
  @keyframes cooking {
    from {
      opacity: 1;
    }
    50% {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
  .low {
    -webkit-animation: cooking 3s linear 0.2s infinite;
    animation: cooking 3s linear 0.2s infinite;
  }
  .middle {
    -webkit-animation: cooking 2s linear 0.2s infinite;
    animation: cooking 2s linear 0.2s infinite;
  }
  .high {
    -webkit-animation: cooking 1s linear 0.2s infinite;
    animation: cooking 1s linear 0.2s infinite;
  }
  :host.top-left,
  :host.bottom-left {
    left: 0;
  }
  :host.top-left,
  :host.top-right {
    top: 0;
    transform: translateY(0px);
  }
  :host.top-left paper-toast,
  :host.top-right paper-toast {
    top: 0;
    transform: translateY(-100px);
  }
  :host.top-left paper-toast.paper-toast-open,
  :host.top-right paper-toast.paper-toast-open {
    top: 12px;
    transform: translateY(0px);
  }
  :host.bottom-left,
  :host.bottom-right {
    bottom: 0;
    transform: translateY(0px);
  }
  :host.bottom-left paper-toast,
  :host.bottom-right paper-toast {
    bottom: 0;
    transform: translateY(100px);
  }
  :host.bottom-left paper-toast.paper-toast-open,
  :host.bottom-right paper-toast.paper-toast-open {
    bottom: 12px;
    transform: translateY(0px);
  }
  </style>

  <template>
    <paper-toast id="toast">
      <span id="grill"></span>
    </paper-toast>
    <iron-signals on-iron-signal-toaster-bake="_bake"></iron-signals>
  </template>

  
</dom-module>`;

document.head.appendChild($_documentContainer.content);
Polymer({

  is: 'toast-er',

  properties: {
    /**
     * Text to display.
     *
     * @type {String}
     * @default
     */
    text: {
      type: String
    },

    /**
     * Duration of displaying.
     *
     * @type {Number}
     * @default 3000
     */
    duration: {
      type: Number,
      value: 3000
    },

    /**
     * Type of toaster. (success | info | warning | error)
     *
     * @type {String}
     * @default
     */
    type: {
      type: String
    },

    /**
     * Defines the speed of blinking of the toast's underline.
     * (low | middle | high)
     *
     * @type {String}
     * @default
     */
    heat: {
      type: String
    },

    /**
     * Sets the toaster position.
     * (top-right | top-left | bottom-right | bottom-left)
     *
     * @type {String}
     * @default
     */
    shelf: {
      type: String
    },

    /**
     * Stack of breads.
     *
     * @type {Array}
     */
    _breads: {
      type: Array,
      value: function() {
        return [];
      }
    }
  },

  /**
   * Shows the toast then `_emptyTheToaster`.
   *
   * @param {Object} event  iron-signal-toaster-bake
   * @param {Object} bread  to bake can contains `text` {String},
   * `type` {String}, `duration` {Number}, `heat` {String} and `shelf` {String}
   */
  _bake: function(event, bread) {
    var text = bread.text || this.text;
    if (text && text.trim().length) {
      this.push('_breads', bread);
      this._emptyTheToaster();
    }
  },

  /**
   * Shows message by unstacking of toasts.
   */
  _emptyTheToaster: function() {
    // Turn off the toaster if the queue is empty.
    if (!this._breads.length) {
      this.async(function() {
        this._turnOffTheToaster();
      }, 1000);
      return;
    }
    // Get configuration of the toast.
    var bread = this._breads[0],
      duration = bread.duration || this.duration,
      type = bread.type || this.type,
      heat = bread.heat || this.heat,
      shelf = bread.shelf || this.shelf,
      toast = this.$.toast;
    // Shows the toast.
    if (!toast.visible) {
      this.shift('_breads');
      toast.text = bread.text || this.text;
      toast.duration = duration;
      this._turnOnTheToaster(type, heat, shelf);
      this.async(function() {
        toast.show();
      }, 100);
    }
    // Queue the next toast.
    this.async(function() {
      this._emptyTheToaster();
    }, duration + 500);
  },

  /**
   * Sets the toaster bottom color according to the given type, defines the
   * blinking speed and sets the toast position.
   *
   * @param  {String} type  (info | success | warning | error) defines the toaster bottom color
   * @param  {String} heat  (low | middle | high) defines the blinking speed
   * @param  {String} shelf (top-left, top-right, bottom-left, bottom-right) defines the toaster position
   */
  _turnOnTheToaster: function(type, heat, shelf) {
    var grill = this.$.grill;
    // Set the grill type.
    type = type && type.toLowerCase() || '';
    this.toggleClass('info', type === 'info', grill);
    this.toggleClass('success', type === 'success', grill);
    this.toggleClass('warning', type === 'warning', grill);
    this.toggleClass('error', type === 'error', grill);
    // Set the grill power.
    heat = heat && heat.toLowerCase() || '';
    this.toggleClass('low', heat === 'low', grill);
    this.toggleClass('middle', heat === 'middle', grill);
    this.toggleClass('high', heat === 'high', grill);
    // Set the toaster position.
    shelf = shelf && shelf.toLowerCase() || ''
    this.toggleClass('top-left', shelf === 'top-left');
    this.toggleClass('top-right', shelf === 'top-right');
    this.toggleClass('bottom-left', shelf === 'bottom-left');
    this.toggleClass('bottom-right', shelf === 'bottom-right');
    if (shelf.indexOf('right') >= 0) {
      this.style.right = (grill.clientWidth + 24) + 'px';
    }
  },

  /**
   * Disables toaster bottom color and blinking.
   */
  _turnOffTheToaster: function() {
    var grill = this.$.grill;
    this.toggleClass('low', false, grill);
    this.toggleClass('middle', false, grill);
    this.toggleClass('high', false, grill);
  }

});
