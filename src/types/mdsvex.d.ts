declare module "*.svx" {
  import { SvelteComponentTyped } from "svelte";
  export default class Component extends SvelteComponentTyped<any> {}
}

declare module "*.md" {
  import { SvelteComponentTyped } from "svelte";
  export default class Component extends SvelteComponentTyped<any> {}
}
