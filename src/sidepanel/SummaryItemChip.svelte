<script lang="ts">
  import { createEventDispatcher } from 'svelte'
  import { Action, SummaryItem } from '../types'

  export let item: SummaryItem

  const dispatch = createEventDispatcher<{ remove: SummaryItem }>()
</script>

<span class="test-xs h-6 pl-[10px] pr-[3px] rounded-xl bg-gray-200 inline-flex items-center">
  <span class="font-bold inline-block mr-[6px] select-none">
    {#if item.action === Action.REGISTER}
      R
    {:else if item.action === Action.DROP}
      D
    {/if}
  </span>
  <span class="inline-block mr-3 select-none">{item.CRN}</span>
  <button
    class="rounded-xl outline-none outline-offset-2 focus-visible:outline-gray-400 focus-visible:outline-1 group"
    on:click={() => dispatch('remove', item)}
  >
    <svg class="inline-block w-[18px] h-[18px] cursor-pointer" focusable="false" viewBox="0 0 24 24"
      ><path
        class="fill-gray-400 group-hover:fill-gray-600 group-focus-visible:fill-gray-600"
        d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z"
      ></path></svg
    ></button
  >
</span>
