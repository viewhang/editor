declare module 'epoch-editor' {
  import type { App, DefineComponent } from 'vue'

  export const UmoEditor: DefineComponent<any, any, any>
  export const UmoMenuButton: DefineComponent<any, any, any>
  export const UmoDialog: DefineComponent<any, any, any>
  export const UmoTooltip: DefineComponent<any, any, any>
  export const useUmoEditor: {
    install: (app: App, options?: Record<string, unknown>) => void
  }

  export default UmoEditor
}
