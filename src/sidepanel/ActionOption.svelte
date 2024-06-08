<script lang="ts">
  import { Action } from '../types'

  export let title: string
  export let representAction: Action
  export let setAction: Action
</script>

<button
  {title}
  on:click={() => (setAction = representAction)}
  class="text-sm hover:font-[500] cursor-pointer after:content-[attr(title)] after:block after:font-bold after:h-0 after:overflow-hidden after:invisible outline-none group"
  class:!font-bold={setAction === representAction}
  class:underline={setAction === representAction}
  ><span
    class="outline-none outline-offset-2 group-focus-visible:outline-gray-400 group-focus-visible:outline-1"
    >{title}</span
  ></button
>
