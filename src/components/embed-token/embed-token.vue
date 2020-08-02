<template>
  <div class="modal" id="embed-token" tabindex="-1" role="dialog">
    <div class="modal-dialog" role="document">
      <div class="modal-content">
        <a href="#" class="close" role="button" aria-label="Close">
          <span aria-hidden="true">&times;</span>
        </a>
        <h5 class="modal-title">
          Embed token
          <button
            class="btn btn-sm float-right"
            data-toggle="tooltip"
            data-title="This will add a badge into your Github Readme which will show the total number of views on the repo."
          >
            <i class="fa fa-info" />
          </button>
        </h5>
        <p>
          Copy and paste the code below into your repository's
          <kbd>Readme.md</kbd> file
        </p>
        <code class="html hljs xml hljs-tag">
          <button
            class="btn btn-sm copy-button"
            type="button"
            ref="embedCopyButton"
            @click="copyCode($refs.embedCopyButton, 'embed-code-block')"
          >
            <i class="fa fa-clipboard mr-5" aria-hidden="true" />Copy
          </button>
          <span id="embed-code-block">
            <span class="hljs-name">
              &lt;a
            </span>
            <span class="hljs-attr"> href</span>=<span class="hljs-string"
              >"{{ trackgitLink }}"</span
            >
            <span class="hljs-name">&gt;</span><br />
            <span class="hljs-name">&lt;img </span>
            <span class="hljs-attr">src</span>=<span class="hljs-string"
              >"{{ token.shortUrl }}"</span
            >
            <span class="hljs-attr"> alt</span>=<span class="hljs-string"
              >"trackgit-views"</span
            >
            <span class="hljs-name"> /&gt;</span><br />
            <span class="hljs-name">&lt;/a&gt;</span>
          </span>
        </code>
        <div class="text-right mt-20">
          <a href="#" class="btn mr-5" role="button">Close</a>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from "vue-property-decorator";
import Token from "@/models/interfaces/Token";
import { Hyperlinks } from "@/models/data/LinkDirectory";

@Component
export default class EmbedToken extends Vue {
  @Prop({ required: true }) readonly token!: Token;

  /** get the link to trackgit landing site */
  get trackgitLink(): string {
    return Hyperlinks.landing;
  }

  /**
   * Copy text to keyboard
   * @param elem The button element which triggers the event
   * @param containerId The container Id whose text to copy
   */
  copyCode(elem: HTMLButtonElement, containerId: string) {
    // Copy code to clipboard
    const range = document.createRange();
    range.selectNode(document.getElementById(containerId) as HTMLDivElement);
    window.getSelection()?.removeAllRanges(); // clear current selection
    window.getSelection()?.addRange(range); // to select text
    document.execCommand("copy");
    window.getSelection()?.removeAllRanges(); // to deselect

    // Show confirmation
    elem.innerHTML =
      "<i class='fa fa-check-circle' aria-hidden='true'></i>&nbsp;Copied!";

    // Hide confirmation
    setTimeout(function() {
      elem.innerHTML =
        "<i class='fa fa-clipboard' aria-hidden='true'></i>&nbsp;Copy";
    }, 2000);
  }
}
</script>

<style lang="scss" scoped>
@import "@/assets/styles/halfmoon-highlight";
code {
  position: relative;
  .copy-button {
    position: absolute;
    bottom: 5px;
    right: 5px;
  }
}
</style>
