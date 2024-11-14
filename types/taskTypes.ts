import type { Spec } from "node-schedule"

export interface DefaultAsyncTaskExport {
  taskName: string
  schedule: Spec
  task: () => Promise<void>
}
