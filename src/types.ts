export enum Action {
  REGISTER = 'RW',
  DROP = 'DW',
  WAITLIST = 'WL',
}

export interface SummaryItem {
  CRN: string
  action: Action
}

export interface Plan {
  items: SummaryItem[]
  autoSubmit: boolean
}