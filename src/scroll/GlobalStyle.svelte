<svelte:head>
  {#if !document.getElementById("style-scroll")}
    <style id="style-scroll">
      .button-scroll {
        position: fixed;
        bottom: 0.5ch;
        z-index: 100;

        button {
          background-color: transparent;
          border: none;
          color: inherit;
          cursor: pointer;
          transition: opacity 400ms;
          opacity: 0.5;
          font-family: monospace;

          &:hover {
            opacity: 1;
          }

          .symbol {
            font-size: 1.5rem;
            line-height: 1;
            display: block;
            rotate: -90deg;
          }
        }
      }
      .large {
        #app > *:not(nav.toc).button-scroll {
          margin-left: initial;
          margin-right: initial;
        }
      }
    </style>
  {/if}
</svelte:head>
