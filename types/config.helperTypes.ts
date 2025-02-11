import type { nodeSchedule } from "@cityssm/scheduled-task"

export interface ConfigFtpPath<S extends string> {
  directory: string
  filePrefix?: string
  fileSuffix?: S
  doDelete?: boolean
}

export interface ConfigScheduledFtpReport<S extends string> {
  ftpPath: ConfigFtpPath<S>
  schedule: nodeSchedule.Spec
}

export type ConfigFileSuffixXlsx = `${string}.xlsx` | `${string}.XLSX`

export interface ConfigNtfyTopic {
  isEnabled: boolean
  topic?: string
}