import '@polymer/polymer/polymer-legacy.js';
import {Polymer} from '@polymer/polymer/lib/legacy/polymer-fn.js';
import {html} from '@polymer/polymer/lib/utils/html-tag.js';

Polymer({
  _template: html`
    <style>
      :host {
        display: block;
        text-align: center;
        background-color: white;
      }
      img {
        margin: 24px 0;
      }
    </style>

    <img src="../images/logo.png">
    <h2>Toilet Evolution</h2>
    <a href="/auth/google/" rel="external"><img src="../images/btn_google+_signin_dark_normal_web@2x.png"></a>
    <p>デバイス管理にはログインが必要です</p>
`,

  is: 'te-login'
});
