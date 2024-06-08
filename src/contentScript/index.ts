import { Action, Plan, SummaryItem as PlannedSummaryItem } from '../types'

function getPlan(): Promise<Plan> {
  return new Promise((resolve) => {
    chrome.storage.local.get('plan', (data) => {      
      resolve(data.plan ?? { items: [], autoSubmit: false })
    })
  })
}

function querySelectorOrThrow<T extends HTMLElement>(selector: string): T {
  const element = document.querySelector<T>(selector)
  if (!element) {
    throw new Error(`Element not found: ${selector}`)
  }
  return element
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

class ActualSummaryItem {
  public readonly CRN: string
  private readonly select: HTMLSelectElement
  private readonly actionButton: HTMLAnchorElement

  constructor(selectElement: HTMLSelectElement) {
    const temp = selectElement.dataset.coursereferencenumber
    if (temp === undefined) throw new Error('CRN not found in select element')
    this.CRN = temp
    this.select = selectElement
    this.actionButton = querySelectorOrThrow<HTMLAnchorElement>(`#s2id_action-${this.CRN}-ddl > a`)
  }

  get options(): string[] {
    return Array.from(this.select.options).map((option) => option.value)
  }

  get option(): string {
    return this.select.value
  }

  set option(value: string) {
    this.actionButton.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }))
    const options = document.querySelectorAll('li.select2-result')
    const optionIdx = this.options.indexOf(value)
    if (optionIdx === -1) throw new Error(`Option ${value} not found`)
    options[optionIdx].dispatchEvent(new MouseEvent('mouseup', { bubbles: true }))
  }
}

class Environment {
  private readonly enterCRNsTabButton: HTMLButtonElement
  private readonly addAnotherCRNInputFieldButton: HTMLButtonElement
  private readonly crnTabSection: HTMLDivElement
  private readonly addCRNToSummaryButton: HTMLButtonElement
  private readonly submitButton: HTMLButtonElement

  constructor() {
    this.enterCRNsTabButton = querySelectorOrThrow('#enterCRNs-tab')
    this.addAnotherCRNInputFieldButton = querySelectorOrThrow('#addAnotherCRN')
    this.crnTabSection = querySelectorOrThrow('#crns')
    this.addCRNToSummaryButton = querySelectorOrThrow('#addCRNbutton')
    this.submitButton = querySelectorOrThrow('#saveButton')
  }

  enterCRNsTab() {
    this.enterCRNsTabButton.click()
  }

  addAnotherCRNInputField() {
    this.addAnotherCRNInputFieldButton.click()
  }

  get crnInputs(): string[] {
    return Array.from(this.crnTabSection.querySelectorAll<HTMLInputElement>('input')).map(
      (input) => input.value,
    )
  }

  set crnInputs(crnInputs: string[]) {
    const inputFieldCount = this.crnInputs.length
    for (let i = 0; i < crnInputs.length - inputFieldCount; i++) {
      this.addAnotherCRNInputField()
    }
    const inputFields = this.crnTabSection.querySelectorAll<HTMLInputElement>('input')
    crnInputs.forEach((crn, i) => {
      inputFields[i].value = crn
    })
  }

  addCRNToSummary() {
    this.addCRNToSummaryButton.click()
  }

  get summaryItems(): ActualSummaryItem[] {
    return Array.from(
      document.querySelectorAll<HTMLSelectElement>('select[data-coursereferencenumber]'),
    ).map((select) => new ActualSummaryItem(select))
  }

  getSummaryItemByCRN(CRN: string): ActualSummaryItem | undefined {
    return this.summaryItems.find((item) => item.CRN === CRN)
  }

  clickSubmit() {
    this.submitButton.click()
  }
}

function getActionName(action: Action): string {
  switch (action) {
    case Action.REGISTER:
      return '"Register"'
    case Action.WAITLIST:
      return '"Waitlist"'
    case Action.DROP:
      return '"Drop"'
    default:
      throw new Error(`Unknown action: ${action}`)
  }
}

function executeAction(actual: ActualSummaryItem, planned: PlannedSummaryItem) {
  if (actual.options.includes(Action.WAITLIST)) {
    actual.option = Action.WAITLIST
    console.warn(`CRN ${planned.CRN} updated to "Waitlist" instead of "Register" (fulled)`)
  } else if (actual.option === planned.action) {
    console.log(`CRN ${planned.CRN} is already set to ${getActionName(planned.action)}, continue`)
  } else if (actual.options.includes(planned.action)) {
    actual.option = planned.action
    console.log(`CRN ${planned.CRN} updated to ${getActionName(planned.action)}`)
  } else {
    console.warn(`CRN ${planned.CRN} is skipped`)
  }
}

async function main() {
  try {
    const env = new Environment()
    const plan: Plan = await getPlan()

    const plannedItems = plan.items
    const alreadyExistedSummaryItems = env.summaryItems
    const missingItemsInSummary = [] as PlannedSummaryItem[]
    const getMissingItemsInSummary = () =>
      missingItemsInSummary.filter((item) => !env.getSummaryItemByCRN(item.CRN))

    // Check if all planned items are already in the summary, if not, we will add them to the summary later. If they are, we execute the action.
    for (const item of plannedItems) {
      const find = alreadyExistedSummaryItems.find((it) => it.CRN === item.CRN)
      if (find) {
        // If the item is already in the summary, we will execute the action.
        executeAction(find, item)
      } else if (item.action !== Action.DROP) {
        // If the action is DROP and the item is not in the summary, we don't need to add it to the summary because it is already dropped.
        missingItemsInSummary.push(item)
      }
    }

    // Add missing items to the summary
    env.enterCRNsTab()
    const crnInputs = missingItemsInSummary.map((item) => item.CRN)
    env.crnInputs = crnInputs
    env.addCRNToSummary()
    console.log(`Added missing items to Summary: ${crnInputs.join(', ')}`)

    // Wait until all missing items are added to the summary for 10s
    for (let i = 0; i < 100; i++) {
      if (getMissingItemsInSummary().length === 0) break
      await sleep(100)
    }

    // Check if all missing items are added to the summary
    const stillMissingItemsInSummary = getMissingItemsInSummary()
    if (stillMissingItemsInSummary.length > 0) {
      throw new Error(
        `After 10s, still missing items in summary: ${stillMissingItemsInSummary.map((item) => item.CRN).join(', ')}`,
      )
    }

    const updatedSummaryItems = env.summaryItems

    // Execute actions for missing items
    for (const item of missingItemsInSummary) {
      const find = updatedSummaryItems.find((it) => it.CRN === item.CRN)
      if (!find) throw new Error(`CRN ${item.CRN} not found in summary`)

      executeAction(find, item)
    }

    // Submit
    if (plan.autoSubmit) {
      console.log('Submitting')
      env.clickSubmit()
    }

    console.log('Exit')
  } catch (error) {
    console.error(error)
  }
}

main()
