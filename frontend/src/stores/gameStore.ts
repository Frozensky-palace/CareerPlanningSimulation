import { defineStore } from 'pinia'
import type { Save, AttributeChanges } from '@/types'

// 从 localStorage 恢复存档状态
const loadSaveFromStorage = (): Save | null => {
  try {
    const saved = localStorage.getItem('currentSave')
    return saved ? JSON.parse(saved) : null
  } catch {
    return null
  }
}

export const useGameStore = defineStore('game', {
  state: () => ({
    currentSave: loadSaveFromStorage(),
    saves: [] as Save[]
  }),

  getters: {
    currentAttributes: (state) => state.currentSave?.attributes || null,
    currentSemester: (state) => state.currentSave?.semester || 1,
    currentWeek: (state) => state.currentSave?.week || 1,
    currentPhase: (state) => state.currentSave?.currentPhase || 'opening',
    remainingEvents: (state) => state.currentSave?.remainingEvents ?? 10
  },

  actions: {
    setCurrentSave(save: Save | null) {
      this.currentSave = save
      // 持久化到 localStorage
      if (save) {
        localStorage.setItem('currentSave', JSON.stringify(save))
      } else {
        localStorage.removeItem('currentSave')
      }
    },

    clearCurrentSave() {
      this.currentSave = null
      localStorage.removeItem('currentSave')
    },

    setSaves(saves: Save[]) {
      this.saves = saves
    },

    updateAttributes(changes: AttributeChanges) {
      if (!this.currentSave) return

      const attrs = this.currentSave.attributes

      if (changes.de) attrs.de = Math.max(0, Math.min(100, attrs.de + changes.de))
      if (changes.zhi) attrs.zhi = Math.max(0, Math.min(100, attrs.zhi + changes.zhi))
      if (changes.ti) attrs.ti = Math.max(0, Math.min(100, attrs.ti + changes.ti))
      if (changes.mei) attrs.mei = Math.max(0, Math.min(100, attrs.mei + changes.mei))
      if (changes.lao) attrs.lao = Math.max(0, Math.min(100, attrs.lao + changes.lao))
    },

    addCompletedScript(scriptId: number) {
      if (!this.currentSave) return
      if (!this.currentSave.completedScripts.includes(scriptId)) {
        this.currentSave.completedScripts.push(scriptId)
      }
    },

    decrementRemainingEvents() {
      if (!this.currentSave) return
      this.currentSave.remainingEvents = Math.max(0, this.currentSave.remainingEvents - 1)
    },

    resetRemainingEvents(count: number = 10) {
      if (!this.currentSave) return
      this.currentSave.remainingEvents = count
    },

    setCurrentPhase(phase: 'opening' | 'midterm' | 'final') {
      if (!this.currentSave) return
      this.currentSave.currentPhase = phase
    },

    advanceWeek() {
      if (!this.currentSave) return

      if (this.currentSave.week < 20) {
        this.currentSave.week++
      } else {
        // 进入下一学期
        if (this.currentSave.semester < 8) {
          this.currentSave.semester++
          this.currentSave.week = 1
        }
      }
    }
  }
})
