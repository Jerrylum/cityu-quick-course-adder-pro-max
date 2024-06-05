<script lang="ts">
  import classNames from 'classnames'
  import '../app.css'
  import logo from '../assets/logo.png'
  import { onMount } from 'svelte'

  enum Action {
    REGISTER = 'RW',
    DROP = 'DW',
    WAITLIST = 'WL',
  }

  let countSync = 0

  let draftCRN = '' as string
  let draftActionType = Action.REGISTER as Action
  let autoSubmit = false as boolean

  onMount(() => {
    chrome.storage.sync.get(['count'], (result) => {
      countSync = result.count || 0
    })

    chrome.runtime.onMessage.addListener((request) => {
      if (request.type === 'COUNT') {
        countSync = request?.count ?? 0
      }
    })
  })
</script>

<main class="p-4 flex flex-col gap-2">
  <div class="w-full h-12 flex gap-3">
    <img src={logo} alt="The extension logo" class="w-12 h-12" />
    <div class="h-12 flex flex-col justify-center">
      <h1 class="text-[18px] leading-6">Quick Course Adder Pro Max</h1>
      <h3 class="text-[12px] leading-4">For CityU's AIMS</h3>
    </div>
  </div>
  <div>
    <h1 class="text-base mb-2">Step 1</h1>
    <p class="text-xs mb-2">
      Enter your CRNs for register, drop or waitlist for courses. Click
      <a
        class="underline text-blue-500"
        href="https://www.cityu.edu.hk/arro/creg/wadp_main.htm"
        target="_blank">here</a
      >
      to learn more about Web Add/Drop.
    </p>
    <div class="w-full h-48 bg-gray-50 mb-3">
      <!-- TODO -->
    </div>
    <div class="flex gap-2">
      <div class="flex flex-col gap-2">
        <div class="flex flex-col">
          <div class="text-xs text-right h-6 pl-1 leading-6">CRN:</div>
        </div>
        <div class="flex flex-col">
          <div class="text-xs text-right h-6 pl-1 leading-6">Action:</div>
        </div>
      </div>
      <div class="flex flex-col gap-2">
        <div>
          <input
            type="text"
            class="w-40 h-6 text-[10px] px-[6px] bg-gray-50 outline-none outline-offset-0 focus-visible:outline-gray-400 focus-visible:outline-1"
            placeholder="5 digits CRN"
            bind:value={draftCRN}
          />
        </div>
        <div class="flex flex-col">
          <div class="text-[10px] h-6 leading-6">
            <button
              title="Register"
              on:click={() => (draftActionType = Action.REGISTER)}
              class={classNames(
                'cursor-pointer after:content-[attr(title)] after:block after:font-bold after:h-0 after:overflow-hidden after:invisible',
                {
                  'font-bold underline': draftActionType === Action.REGISTER,
                },
              )}>Register</button
            >
            <span class="inline-block px-1">/</span>
            <button
              title="Drop"
              on:click={() => (draftActionType = Action.DROP)}
              class={classNames(
                'cursor-pointer after:content-[attr(title)] after:block after:font-bold after:h-0 after:overflow-hidden after:invisible',
                {
                  'font-bold underline': draftActionType === Action.DROP,
                },
              )}>Drop</button
            >
            <span class="inline-block px-1">/</span>
            <button
              title="Waitlist"
              on:click={() => (draftActionType = Action.WAITLIST)}
              class={classNames(
                'cursor-pointer after:content-[attr(title)] after:block after:font-bold after:h-0 after:overflow-hidden after:invisible',
                {
                  'font-bold underline': draftActionType === Action.WAITLIST,
                },
              )}>Waitlist</button
            >
          </div>
          <div class="text-[10px] text-gray-500 leading-3 mb-3">
            {#if draftActionType === Action.REGISTER}
              Add this CRN to Summary section, then select "Web Register" in the action dropdown
              menu
            {:else if draftActionType === Action.DROP}
              Select "Web Drop" in the action dropdown menu for this CRN if it is in the Summary
              section
            {:else if draftActionType === Action.WAITLIST}
              Add this CRN to Summary section, then select "Waitlist" in the action dropdown menu
            {/if}
          </div>
          <div>
            <button
              class="h-6 text-[12px] px-4 bg-gray-50 inline-block outline-none outline-offset-0 focus-visible:outline-gray-400 focus-visible:outline-1"
              >Add</button
            >
          </div>
        </div>
      </div>
    </div>
  </div>
  <hr class="text-gray-50 my-2" />
  <div>
    <h1 class="text-base mb-2">Step 2</h1>
    <p class="text-xs mb-2">
      Once you are at the Course Registration page, we will instantly execute the above actions for
      each CRN.
    </p>
    <div class="flex gap-2 mb-2">
      <div class="leading-4">Auto Submit:</div>
      <div class="leading-4 flex gap-1 items-center">
        <input type="checkbox" class="h-3 w-3" bind:checked={autoSubmit} />
        <div>
          {#if autoSubmit}
            True
          {:else}
            False
          {/if}
        </div>
      </div>
    </div>
    <div class="text-[10px] text-gray-500 leading-3 mb-3">
      {#if autoSubmit}
        We will also click SUBMIT automatically at the Course Registration page to finish
        registration
      {:else}
        You will need to click SUBMIT at the Course Registration page to finish registration
      {/if}
    </div>
  </div>
</main>

<style lang="postcss">
  :global(body) {
    @apply font-sans;
  }
</style>
