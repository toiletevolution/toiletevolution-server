import '@polymer/polymer/polymer-legacy.js';
import {Polymer} from '@polymer/polymer/lib/legacy/polymer-fn.js';
import {html} from '@polymer/polymer/lib/utils/html-tag.js';
import '@polymer/app-layout/app-scroll-effects/app-scroll-effects.js';
import '@polymer/app-layout/app-box/app-box.js';
import './te-fade-background.js';

Polymer({
  _template: html`
    <style>
      :host {
        margin: 0;
        font-family: 'Roboto', 'Noto', sans-serif;
        background-color: #eee;
        height: 100%;
      }
      #scrollingRegion {
        height: 100%;
        overflow-y: auto;
      }

      app-box {
        height: 600px;
      }

      .logo {
        --app-box-background-front-layer: {
          background-image: url(/images/wc-265279_1920.jpg);
          width:100%;
          height: 800px;
        }
      }

      .problem {
        --app-box-background-front-layer: {
          background-image: url(/images/about_background2.jpg);
          background-position: bottom;
          padding-bottom: 120px;
          margin-top: -20px;
          height: 100%;
          opacity: 0;
        };
      }

      .visualization {
        --app-box-background-front-layer: {
          background-image: url(/images/about_background_user.jpg);
          background-position: bottom;
          padding-bottom: 120px;
          margin-top: -20px;
          height: 100%;
          opacity: 0;
        };
      }

      .management {
        --app-box-background-front-layer: {
          background-image: url(/images/about_background_admin.jpg);
          background-position: bottom;
          padding-bottom: 120px;
          margin-top: -20px;
          height: 100%;
          opacity: 0;
        };
      }

      .oss {
        --app-box-background-front-layer: {
          background-image: url(/images/about_background_open.jpg);
          background-position: bottom;
          padding-bottom: 120px;
          margin-top: -20px;
          height: 100%;
          opacity: 0;
        };
      }

      article {
        font-weight: 100;
        max-width: 500px;
        margin: 0 auto;
        text-align: center;
      }
      .problem article,
      .management article {
        margin: 0 20px;
        text-align: left;
        box-sizing: border-box;
      }
      .visualization article,
      .oss article {
        margin: 0 20px 0 auto;
        padding-left: 20px;
        text-align: left;
        box-sizing: border-box;
      }
      article h2 {
        font-weight: 100;
        font-size: 38px;
        margin: 0;
        padding: 20px 0;
        color: white;
        text-shadow: 0 0 1em rgba(0,0,0,0.9);
      }
      article p {
        font-size: 14px;
        line-height: 30px;
        color: white;
        text-shadow: 0 0 1em rgba(0,0,0,0.9);
      }
      article p b {
        font-size: 9px;
        text-decoration: underline;
      }
      img.logo {
        margin: 1em 0;
        filter: grayscale(1);
      }

    </style>
    <div id="scrollingRegion">
      <section>
        <app-box class="logo" scroll-target="scrollingRegion" effects="parallax-background te-fade-background">
          <article>
            <h2>トイレの空き状況を<br>見える化したい</h2>
            <p>Toilet Evolutionは、そんな要望に応えるための<br>IoTサービスプラットフォームです。</p>
            <p><img src="/images/logo.png" class="logo"></p>
          </article>
        </app-box>
      </section>

      <section>
        <!--
  This app-box uses the class \`.second\` and the mixin \`--app-box-background-front-layer\` to assign the background image.
  -->
        <app-box class="problem" scroll-target="scrollingRegion" effects="parallax-background te-fade-background">
          <article>
            <h2>解決したい課題</h2>
            <p>
            空き状況が見えてないと、緊急事態に対応できないかもしれません。<br>
            もちろん一番近くのトイレが空いていれば問題ありません。<br>
            しかし、満室ときは待つよりも、初めから空いているトイレを選択できた方が良いという考えがあるはずです。<br>
            もし、トイレの空き状況が見える化できていれば、違うフロアを選ぶことで課題を解消できるのではないでしょうか？
            </p>
          </article>
        </app-box>

      </section>

      <section>
        <app-box class="visualization" scroll-target="scrollingRegion" effects="parallax-background te-fade-background">
          <article>
            <h2>直近5分の状況を見える化</h2>
            <p>
            Toilet EvolutionのWebアプリを使うと、現在のトイレの空き状況をアイコンを使って直感的に判断することができます。<br>
            もちろん利用時間に差はあるでしょうが、直近5分の空き状況もわかるので、もうすぐ空くのではないかという予測にも役立つでしょう。
            </p>
          </article>
        </app-box>
      </section>

      <section>
        <app-box class="management" scroll-target="scrollingRegion" effects="parallax-background te-fade-background">
          <article>
            <h2>デバイスの登録と<br>データの送信</h2>
            <p>
            トイレの空き状況を調べるのに高価なデバイスを利用しなくても良いように、データの送信にはHTTP(S)、認証はベーシック認証を使っています。<br>
            トイレの空き状況データ送信に、計算コストが高いSHA-2などの暗号化を使うと、CPUの性能が良いマイコンが必要になります。
            Toilet Evolutionでは、他のサービスとは違い、安価に見える化したい要望に応える仕様を採用しています。<br>
            データを送信するデバイスの登録はWebから簡単にできます。また空いているかどうか判断するためのしきい値と条件もWeb上から設定することができます。<br>
            <b>現時点で編集機能は未実装のため、設定を変更したい場合は、削除したあと追加する必要があります。</b>
            </p>
          </article>
        </app-box>
      </section>

      <section>
        <app-box class="oss" scroll-target="scrollingRegion" effects="parallax-background te-fade-background">
          <article>
            <h2>すべてをオープンに</h2>
            <p>
              Toilet EvolutionのWebアプリからは、toiletevolution.spaceのサイトに登録されたトイレの状況をすべて閲覧することができます。<br>
              もしクローズドな環境で使いたい場合は、ソースコードがオープンになっているので、自分のアカウントでGAE(Google App Engine)にデプロイすることも可能です。<br>
              サイトのデータ、ソースコードすべてがオープンになっています。<br>
              <b>デバイスの登録、管理、データの送信にはユーザー登録(無料)が必要です。</b>
            </p>
          </article>
        </app-box>
      </section>

    </div>
`,

  is: 'te-about'
});
