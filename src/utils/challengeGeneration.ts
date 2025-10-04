import { TrainingList, HistoryEntry, ItemRatings, TrainingAlgorithm } from '../types'

interface ChallengeResult {
  item: string
  category: string
}

export function generateNextChallenge(
  activeList: TrainingList,
  settings: {
    algorithmMode: boolean
    selectedAlgorithm: string
  },
  itemRatings: ItemRatings,
  history: HistoryEntry[],
  trainingAlgorithms: TrainingAlgorithm[]
): ChallengeResult {
  const selectedAlgorithm = trainingAlgorithms.find(alg => alg.id === settings.selectedAlgorithm) || trainingAlgorithms[0]

  if (!settings.algorithmMode || selectedAlgorithm.id === 'random') {
    // Pure random selection
    const categories = Object.keys(activeList.categories)
    const category = categories[Math.floor(Math.random() * categories.length)]
    const items = activeList.categories[category]
    const item = items[Math.floor(Math.random() * items.length)]

    return { item, category }
  }

  // Smart algorithm selection
  const allItems: Array<{item: string, category: string, score: number}> = []

  // Calculate scores for all items
  for (const [categoryName, items] of Object.entries(activeList.categories)) {
    for (const itemName of items) {
      let score = 1 // Base score

      // Apply struggling weight
      const rating = itemRatings[itemName]
      if (rating === 'failed' || rating === 'struggled') {
        score += selectedAlgorithm.strugglingWeight * 2
      } else if (rating === 'easy') {
        score -= selectedAlgorithm.strugglingWeight * 0.5
      }

      // Apply recent practice weight
      const recentPractice = history
        .filter(h => h.item === itemName)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]

      if (recentPractice) {
        const daysSince = (Date.now() - new Date(recentPractice.date).getTime()) / (1000 * 60 * 60 * 24)
        if (daysSince < 1) {
          score -= selectedAlgorithm.recentWeight * 1.5
        } else if (daysSince < 3) {
          score -= selectedAlgorithm.recentWeight * 0.8
        }
      } else {
        score += 0.5
      }

      // Spaced repetition logic
      if (selectedAlgorithm.spacedRepetition && rating && recentPractice) {
        const daysSince = (Date.now() - new Date(recentPractice.date).getTime()) / (1000 * 60 * 60 * 24)
        const targetInterval = rating === 'failed' ? 0.5 : rating === 'struggled' ? 1 : rating === 'got-it' ? 3 : 7

        if (daysSince >= targetInterval) {
          score += 1
        } else {
          score -= 0.5
        }
      }

      allItems.push({ item: itemName, category: categoryName, score: Math.max(0.1, score) })
    }
  }

  // Category balancing
  if (selectedAlgorithm.categoryBalance) {
    const categoryCount: Record<string, number> = {}
    history.slice(-20).forEach(h => {
      categoryCount[h.category] = (categoryCount[h.category] || 0) + 1
    })

    allItems.forEach(item => {
      const recentCount = categoryCount[item.category] || 0
      if (recentCount > 3) {
        item.score *= 0.7
      }
    })
  }

  // Weighted random selection
  const totalScore = allItems.reduce((sum, item) => sum + item.score, 0)
  let randomValue = Math.random() * totalScore

  for (const item of allItems) {
    randomValue -= item.score
    if (randomValue <= 0) {
      return { item: item.item, category: item.category }
    }
  }

  // Fallback to random
  const categories = Object.keys(activeList.categories)
  const category = categories[Math.floor(Math.random() * categories.length)]
  const items = activeList.categories[category]
  const item = items[Math.floor(Math.random() * items.length)]

  return { item, category }
}