<script lang="ts">
  import '../app.css'
  import logo from '../assets/logo.svg'
  import { onMount } from 'svelte'
  import { Action, Plan } from '../types'
  import ActionOption from './ActionOption.svelte'
  import SummaryItemChip from './SummaryItemChip.svelte'
  import { FormEventHandler } from 'svelte/elements'

  let draftCRN = '' as string
  let draftActionType = Action.REGISTER as Action
  let displayError = '' as string

  let plan: Plan = { items: [], autoSubmit: false }

  let crnInput: HTMLInputElement

  onMount(() => {
    chrome.storage.local.get(['plan'], (result) => {
      plan = result.plan ?? plan
    })

    // chrome.runtime.onMessage.addListener((request) => {
    //   if (request.type === 'COUNT') {
    //     countSync = request?.count ?? 0
    //   }
    // })
  })

  const onInput: FormEventHandler<HTMLInputElement> = (e) => {
    const value = e.currentTarget.value
    if (!/^\d{0,5}$/.test(value)) {
      e.currentTarget.value = value.replace(/\D/g, '')
    }
  }

  function onAddCRN() {
    if (!/^\d{5}$/.test(draftCRN)) {
      displayError = 'CRN is not 5 digit'
      return
    }
    if (plan.items.filter((i) => i.CRN === draftCRN).length > 0) {
      displayError = 'CRN is duplicated'
      return
    }
    plan.items.push({ CRN: draftCRN, action: draftActionType })
    plan.items = plan.items // force update
    draftCRN = ''
    draftActionType = Action.REGISTER
    displayError = ''
    crnInput.focus()
    syncPlan()
  }

  function onDeleteCRN(crn: string) {
    plan.items = plan.items.filter((i) => i.CRN !== crn)
    syncPlan()
  }

  function syncPlan() {
    chrome.storage.local.set({ plan })
  }
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
        class="underline text-blue-500 outline-none outline-offset-2 focus-visible:outline-gray-400 focus-visible:outline-1"
        href="https://www.cityu.edu.hk/arro/creg/wadp_main.htm"
        target="_blank">here</a
      >
      to learn more about Web Add/Drop.
    </p>
    {#if plan.items.length > 0}
      <div
        class="w-full h-24 bg-gray-50 mb-3 p-[6px] flex gap-[6px] flex-wrap content-start overflow-y-auto"
      >
        {#each plan.items as item (item.CRN)}
          <SummaryItemChip {item} on:remove={(it) => onDeleteCRN(it.detail.CRN)} />
        {/each}
      </div>
    {:else}
      <div class="w-full h-24 bg-gray-50 mb-3 p-[6px]">
        <div class="text-xs text-gray-500 mb-3 select-none">
          All pending actions will be shown here
        </div>
      </div>
    {/if}
    <div class="flex gap-2">
      <div class="flex flex-col gap-2">
        <div class="flex flex-col">
          <div class="text-xs text-right h-6 pl-1 leading-6">CRN:</div>
        </div>
        {#if displayError !== ''}
          <div class="flex flex-col h-[12px]"></div>
        {/if}
        <div class="flex flex-col">
          <div class="text-xs text-right h-6 pl-1 leading-6">Action:</div>
        </div>
      </div>
      <div class="flex flex-col gap-2">
        <div class="flex">
          <input
            type="text"
            class="w-40 h-6 text-[12px] px-[6px] bg-gray-50 outline-none outline-offset-0 focus-visible:outline-gray-400 focus-visible:outline-1"
            maxlength="5"
            placeholder="5 digits CRN"
            bind:this={crnInput}
            on:input={onInput}
            on:keydown={(e) => {
              if (e.key === 'Enter') {
                onAddCRN()
              }
            }}
            bind:value={draftCRN}
          />
        </div>
        {#if displayError !== ''}
          <div class="flex flex-col text-[10px] h-[12px] text-red-500">{displayError}</div>
        {/if}
        <div class="flex flex-col">
          <div class="text-xs h-6 leading-6">
            <ActionOption
              title="Register"
              representAction={Action.REGISTER}
              bind:setAction={draftActionType}
            />
            <span class="inline-block px-1">/</span>
            <ActionOption
              title="Drop"
              representAction={Action.DROP}
              bind:setAction={draftActionType}
            />
          </div>
          <div class="text-[10px] text-gray-500 leading-3 mb-3">
            {#if draftActionType === Action.REGISTER}
              Add this CRN to the Summary section, then select “Web Register” or “Waitlist” (if the
              selected course is full) in the action dropdown menu
            {:else if draftActionType === Action.DROP}
              Select “Web Drop” in the action dropdown menu for this CRN if it is in the Summary
              section
            {/if}
          </div>
          <div>
            <button
              class="h-6 text-xs px-4 bg-gray-50 hover:bg-gray-200 focus-visible:bg-gray-200 inline-block select-none outline-none outline-offset-0 focus-visible:outline-gray-400 focus-visible:outline-1"
              on:click={onAddCRN}>Add</button
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
        <input
          type="checkbox"
          id="autoSubmit"
          class="h-3 w-3 outline-none outline-offset-2 focus-visible:outline-gray-400 focus-visible:outline-1"
          bind:checked={plan.autoSubmit}
          on:change={syncPlan}
        />
        <label for="autoSubmit">
          {#if plan.autoSubmit}
            True
          {:else}
            False
          {/if}
        </label>
      </div>
    </div>
    <div class="text-[10px] text-gray-500 leading-3 mb-3">
      {#if plan.autoSubmit}
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

  *::-webkit-scrollbar {
    width: 6.4px;
  }

  *::-webkit-scrollbar-track {
    -webkit-box-shadow: inset 0 0 6px rgba(0, 0, 0, 0);
  }

  *::-webkit-scrollbar-thumb {
    background-color: rgba(0, 0, 0, 0.2);
    border-radius: 3.2px;
  }
</style>
