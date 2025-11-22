import express from 'express'
import { authMiddleware, AuthRequest } from '../middleware/auth.js'
import { Save } from '../models/index.js'

const router = express.Router()

// 阶段中文名映射
const PHASE_LABELS: Record<string, string> = {
  opening: '期初',
  midterm: '期中',
  final: '期末'
}

// 生成评价文本
const generateEvaluation = (attributes: any): string[] => {
  const evaluations: string[] = []

  if (attributes.zhi >= 80) {
    evaluations.push('学业表现优秀，继续保持！')
  } else if (attributes.zhi >= 60) {
    evaluations.push('学业进展良好，还有提升空间。')
  } else {
    evaluations.push('学业需要加强，建议多花时间学习。')
  }

  if (attributes.ti >= 70) {
    evaluations.push('身体素质出色，运动达人！')
  } else if (attributes.ti < 40) {
    evaluations.push('需要加强锻炼，健康是本钱。')
  }

  if (attributes.de >= 70) {
    evaluations.push('品德修养良好，乐于助人。')
  }

  if (attributes.mei >= 70) {
    evaluations.push('艺术素养不错，审美能力出众。')
  }

  if (attributes.lao >= 70) {
    evaluations.push('劳动积极，实践能力强。')
  }

  // 如果没有特别突出的，给个通用评价
  if (evaluations.length === 0) {
    evaluations.push('各方面发展均衡，继续努力！')
  }

  return evaluations
}

// 获取结算数据
router.get('/:saveId', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const save = await Save.findOne({
      where: {
        id: req.params.saveId,
        userId: req.userId
      }
    })

    if (!save) {
      return res.status(404).json({
        code: 404,
        message: '存档不存在'
      })
    }

    const phaseLabel = PHASE_LABELS[save.currentPhase] || save.currentPhase
    const evaluations = generateEvaluation(save.attributes)

    res.json({
      code: 200,
      data: {
        save,
        settlement: {
          semester: save.semester,
          phase: save.currentPhase,
          phaseLabel,
          attributes: save.attributes,
          completedCount: save.completedScripts?.length || 0,
          evaluations
        }
      }
    })
  } catch (error: any) {
    console.error('Get settlement error:', error)
    res.status(500).json({
      code: 500,
      message: error.message || '获取结算数据失败'
    })
  }
})

// 确认结算，推进到下一阶段
router.post('/:saveId/confirm', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const save = await Save.findOne({
      where: {
        id: req.params.saveId,
        userId: req.userId
      }
    })

    if (!save) {
      return res.status(404).json({
        code: 404,
        message: '存档不存在'
      })
    }

    // 推进阶段
    let nextPhase: 'opening' | 'midterm' | 'final' = 'opening'
    let nextSemester = save.semester
    let nextWeek = save.week

    switch (save.currentPhase) {
      case 'opening':
        nextPhase = 'midterm'
        nextWeek = 8  // 期中从第8周开始
        break
      case 'midterm':
        nextPhase = 'final'
        nextWeek = 15  // 期末从第15周开始
        break
      case 'final':
        // 进入下一学期
        nextPhase = 'opening'
        nextSemester = Math.min(save.semester + 1, 8)
        nextWeek = 1
        break
    }

    // 重置事件数
    const remainingEvents = 10

    // 更新存档
    save.currentPhase = nextPhase
    save.semester = nextSemester
    save.week = nextWeek
    save.remainingEvents = remainingEvents
    await save.save()

    const phaseLabel = PHASE_LABELS[nextPhase]

    res.json({
      code: 200,
      message: '进入下一阶段',
      data: {
        save,
        nextPhase,
        nextPhaseLabel: phaseLabel,
        nextSemester,
        nextWeek
      }
    })
  } catch (error: any) {
    console.error('Confirm settlement error:', error)
    res.status(500).json({
      code: 500,
      message: error.message || '结算确认失败'
    })
  }
})

export default router
