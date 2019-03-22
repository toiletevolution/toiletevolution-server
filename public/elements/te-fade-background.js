import {registerEffect} from '@polymer/app-layout/helpers/helpers.js';
import '@polymer/app-layout/app-scroll-effects/app-scroll-effects-behavior.js';

/**
 * Upon scrolling past a threshold, fade in the rear background layer and fade out the front
 * background layer (opacity CSS transitioned over time).
 *
 *
 */
registerEffect('te-fade-background', {
  /** @this Polymer.AppLayout.ElementWithBackground */
  setUp: function setUp(config) {
    var fx = {};
    var duration = config.duration || '0.5s';
    fx.backgroundFrontLayer = this._getDOMRef('backgroundFrontLayer');
    fx.backgroundFrontLayer.style.willChange = 'opacity';
    fx.backgroundFrontLayer.style.webkitTransform = 'translateZ(0)';
    fx.backgroundFrontLayer.style.transitionProperty = 'opacity';
    fx.backgroundFrontLayer.style.transitionDuration = duration;
    this._fxFadeBackground = fx;
  },
  /** @this Polymer.AppLayout.ElementWithBackground */
  run: function run(p, y) {
    var fx = this._fxFadeBackground;
    if (p >= 1) {
      fx.backgroundFrontLayer.style.opacity = 0;
    } else {
      fx.backgroundFrontLayer.style.opacity = 1;
    }
  },
  /** @this Polymer.AppLayout.ElementWithBackground */
  tearDown: function tearDown() {
    delete this._fxFadeBackground;
  }
});
