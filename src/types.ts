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
export enum LogMessageType {
  INFO = 'INFO',
  WARNING = 'WARNING',
  ERROR = 'ERROR',
}

export interface LogMessage {
  type: LogMessageType
  message: string
}

export interface LogExtensionMessage {
  nature: 'log'
  payload: LogMessage
}

export type ExtensionMessage = LogExtensionMessage
