import { defineStore } from 'pinia'
import type { Script, ScriptNode } from '@/types'

export const useScriptStore = defineStore('script', {
  state: () => ({
    scripts: [] as Script[],
    currentScript: null as Script | null,
    currentNode: null as ScriptNode | null
  }),

  actions: {
    setScripts(scripts: Script[]) {
      this.scripts = scripts
    },

    setCurrentScript(script: Script) {
      this.currentScript = script
    },

    setCurrentNode(node: ScriptNode) {
      this.currentNode = node
    }
  }
})
