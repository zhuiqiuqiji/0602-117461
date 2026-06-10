<template>
  <div class="game-container">
    <header class="game-header">
      <h1 class="game-title">⚡ 激光反射</h1>
      <StatusBar
        :level="currentLevel"
        :maxElements="maxElements"
        :remainingElements="remainingElements"
        :isWon="isWon"
        :stars="stars"
        @reset="resetLevel"
        @next="nextLevel"
        @show-levels="showLevelSelect = true"
      />
    </header>

    <main class="game-main">
      <div class="hint-bar" v-if="levelData.hint">
        <span class="hint-icon">💡</span>
        <span class="hint-text">{{ levelData.hint }}</span>
      </div>

      <div class="board-wrapper">
        <GameBoard
          :cols="cols"
          :rows="rows"
          :emitters="emitters"
          :targets="targets"
          :elements="allElements"
          :laserSegments="laserSegments"
          :isWon="isWon"
          :hitTargets="hitTargets"
          :preElementPositions="preElementPositions"
          @place-element="placeElement"
          @remove-element="removeElement"
        />
      </div>

      <MirrorPanel
        :maxElements="maxElements"
        :remainingElements="remainingElements"
        :selectedType="selectedElementType"
        :isWon="isWon"
        :availableTypes="availableTypes"
        @select="selectElementType"
      />

      <div class="bottom-actions">
        <button v-if="levelData.knowledgeId" class="action-link" @click="showKnowledge = true">
          📖 光学知识卡片
        </button>
        <button class="action-link" @click="showEditor = true">
          🛠️ 关卡编辑器
        </button>
      </div>
    </main>

    <Teleport to="body">
      <div v-if="showLevelSelect" class="modal-overlay" @click.self="showLevelSelect = false">
        <div class="modal-content level-modal">
          <h2>选择关卡</h2>
          <div class="level-grid">
            <button
              v-for="lvl in allLevels"
              :key="lvl.id"
              class="level-btn"
              :class="{ active: lvl.id === currentLevel, locked: isLevelLocked(lvl) }"
              :disabled="isLevelLocked(lvl)"
              @click="loadLevel(lvl.id)"
            >
              <span class="level-num">{{ lvl.id }}</span>
              <span class="level-name">{{ lvl.name }}</span>
              <span v-if="!isLevelLocked(lvl)" class="level-stars">
                {{ getSavedStars(lvl.id) }}
              </span>
            </button>
          </div>
          <button class="close-btn" @click="showLevelSelect = false">关闭</button>
        </div>
      </div>
    </Teleport>

    <Teleport to="body">
      <div v-if="showWinModal" class="modal-overlay" @click.self="showWinModal = false">
        <div class="modal-content win-modal">
          <div class="win-icon">🎉</div>
          <h2>通关成功！</h2>
          <div class="star-rating">
            <span v-for="i in 3" :key="i" class="star" :class="{ filled: i <= stars }">★</span>
          </div>
          <p class="win-desc">你用 {{ placedElements.length }} 个元件完成了第 {{ currentLevel }} 关</p>
          <p v-if="stars === 3" class="win-perfect">✨ 完美通关！</p>
          <p v-else-if="stars < 3" class="win-tip">提示：用 ≤{{ levelData.optimalElements }} 个元件可获得三星</p>
          <div class="win-actions">
            <button v-if="currentLevel < allLevels.length" class="btn btn-primary" @click="nextLevel(); showWinModal = false">下一关</button>
            <button class="btn btn-secondary" @click="resetLevel(); showWinModal = false">重玩</button>
            <button class="btn btn-secondary" @click="showWinModal = false">关闭</button>
          </div>
        </div>
      </div>
    </Teleport>

    <Teleport to="body">
      <KnowledgeCard
        v-if="showKnowledge"
        :knowledgeId="levelData.knowledgeId"
        @close="showKnowledge = false"
      />
    </Teleport>

    <Teleport to="body">
      <LevelEditor
        v-if="showEditor"
        @close="showEditor = false"
        @play-custom="playCustomLevel"
      />
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { levels } from './game/levels.js'
import { traceAllLaserPaths, checkWin, getStarRating } from './game/laserEngine.js'
import GameBoard from './components/GameBoard.vue'
import StatusBar from './components/StatusBar.vue'
import MirrorPanel from './components/MirrorPanel.vue'
import KnowledgeCard from './components/KnowledgeCard.vue'
import LevelEditor from './components/LevelEditor.vue'

const STORAGE_KEY_CUSTOM_LEVELS = 'laser-puzzle:custom-levels'
const STORAGE_KEY_SAVED_STARS = 'laser-puzzle:saved-stars'
const STORAGE_KEY_UNLOCKED_LEVEL = 'laser-puzzle:unlocked-level'

const OFFICIAL_LEVEL_COUNT = levels.length

function loadCustomLevels() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CUSTOM_LEVELS)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function loadSavedStars() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SAVED_STARS)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function loadUnlockedLevel() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_UNLOCKED_LEVEL)
    const val = raw ? parseInt(raw, 10) : 1
    return isNaN(val) || val < 1 ? 1 : val
  } catch {
    return 1
  }
}

const currentLevel = ref(1)
const unlockedLevel = ref(loadUnlockedLevel())
const selectedElementType = ref('/')
const placedElements = ref([])
const showLevelSelect = ref(false)
const showWinModal = ref(false)
const showKnowledge = ref(false)
const showEditor = ref(false)
const customLevels = ref(loadCustomLevels())
const savedStars = ref(loadSavedStars())

watch(customLevels, (val) => {
  localStorage.setItem(STORAGE_KEY_CUSTOM_LEVELS, JSON.stringify(val))
}, { deep: true })

watch(savedStars, (val) => {
  localStorage.setItem(STORAGE_KEY_SAVED_STARS, JSON.stringify(val))
}, { deep: true })

watch(unlockedLevel, (val) => {
  localStorage.setItem(STORAGE_KEY_UNLOCKED_LEVEL, String(val))
})

const allLevels = computed(() => [...levels, ...customLevels.value])

const levelData = computed(() => allLevels.value.find(l => l.id === currentLevel.value) || levels[0])
const cols = computed(() => levelData.value.cols)
const rows = computed(() => levelData.value.rows)
const emitters = computed(() => levelData.value.emitters)
const targets = computed(() => levelData.value.targets)
const maxElements = computed(() => levelData.value.maxElements)
const availableTypes = computed(() => levelData.value.availableTypes || ['/', '\\'])

const preElementPositions = computed(() => levelData.value.preElements.map(e => `${e.x},${e.y}`))

const allElements = computed(() => {
  return [...levelData.value.preElements, ...placedElements.value]
})

const remainingElements = computed(() => maxElements.value - placedElements.value.length)

const laserSegments = computed(() => {
  return traceAllLaserPaths(emitters.value, allElements.value, cols.value, rows.value)
})

const hitTargets = computed(() => {
  return targets.value.filter(tgt => {
    const requiredColor = tgt.color || null
    return laserSegments.value.some(seg => {
      if (seg.outOfBounds) return false
      if (seg.x2 !== tgt.x || seg.y2 !== tgt.y) return false
      if (requiredColor && seg.color !== requiredColor) return false
      return true
    })
  })
})

const isWon = computed(() => checkWin(laserSegments.value, targets.value))

const stars = computed(() => {
  return getStarRating(placedElements.value.length, maxElements.value, levelData.value.optimalElements)
})

function getSavedStars(levelId) {
  const s = savedStars.value[levelId] || 0
  return s > 0 ? '★'.repeat(s) + '☆'.repeat(3 - s) : ''
}

function isLevelLocked(lvl) {
  if (lvl.id > OFFICIAL_LEVEL_COUNT) return false
  return lvl.id > unlockedLevel.value
}

watch(isWon, (won) => {
  if (won) {
    const currentStars = savedStars.value[currentLevel.value] || 0
    if (stars.value > currentStars) {
      savedStars.value = { ...savedStars.value, [currentLevel.value]: stars.value }
    }
    setTimeout(() => {
      showWinModal.value = true
      if (currentLevel.value >= unlockedLevel.value && currentLevel.value < allLevels.value.length) {
        unlockedLevel.value = currentLevel.value + 1
      }
    }, 400)
  }
}, { immediate: true })

function selectElementType(type) {
  selectedElementType.value = type
}

function placeElement({ x, y }) {
  if (isWon.value) return
  const existing = placedElements.value.findIndex(e => e.x === x && e.y === y)
  if (existing >= 0) {
    placedElements.value[existing].type = selectedElementType.value
    placedElements.value = [...placedElements.value]
    return
  }
  if (remainingElements.value <= 0) return
  placedElements.value = [...placedElements.value, { x, y, type: selectedElementType.value }]
}

function removeElement({ x, y }) {
  placedElements.value = placedElements.value.filter(e => !(e.x === x && e.y === y))
}

function resetLevel() {
  placedElements.value = []
  showWinModal.value = false
}

function nextLevel() {
  if (currentLevel.value < allLevels.value.length) {
    currentLevel.value++
    resetLevel()
  }
}

function loadLevel(id) {
  currentLevel.value = id
  resetLevel()
  showLevelSelect.value = false
}

function playCustomLevel(levelData) {
  const existingIds = new Set(allLevels.value.map(l => l.id))
  let newId = OFFICIAL_LEVEL_COUNT + 1
  while (existingIds.has(newId)) {
    newId++
  }
  customLevels.value = [...customLevels.value, { ...levelData, id: newId }]
  currentLevel.value = newId
  resetLevel()
  showEditor.value = false
}
</script>

<style scoped>
.game-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #0a0e1a 0%, #111827 50%, #0f172a 100%);
}

.game-header {
  padding: 16px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid var(--border-color);
  background: rgba(17, 24, 39, 0.8);
  backdrop-filter: blur(12px);
}

.game-title {
  font-size: 1.5rem;
  font-weight: 700;
  background: linear-gradient(135deg, #06b6d4, #8b5cf6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.game-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24px 16px;
  gap: 16px;
}

.hint-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(234, 179, 8, 0.1);
  border: 1px solid rgba(234, 179, 8, 0.3);
  border-radius: 8px;
  padding: 8px 16px;
  max-width: 600px;
  width: 100%;
}

.hint-icon {
  font-size: 1rem;
}

.hint-text {
  font-size: 0.85rem;
  color: var(--text-secondary);
}

.board-wrapper {
  position: relative;
}

.bottom-actions {
  display: flex;
  gap: 12px;
}

.action-link {
  background: none;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 8px 16px;
  color: var(--accent);
  cursor: pointer;
  font-size: 0.85rem;
  transition: all 0.2s;
}

.action-link:hover {
  border-color: var(--accent);
  background: rgba(6, 182, 212, 0.1);
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  padding: 32px;
  max-width: 520px;
  width: 90%;
  text-align: center;
  max-height: 85vh;
  overflow-y: auto;
}

.modal-content h2 {
  font-size: 1.4rem;
  margin-bottom: 20px;
  color: var(--text-primary);
}

.level-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
  margin-bottom: 20px;
}

.level-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 10px 6px;
  border-radius: 10px;
  border: 1px solid var(--border-color);
  background: var(--bg-secondary);
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
}

.level-btn:hover:not(:disabled) {
  border-color: var(--accent);
  background: rgba(6, 182, 212, 0.1);
}

.level-btn.active {
  border-color: var(--accent);
  background: rgba(6, 182, 212, 0.15);
  box-shadow: 0 0 12px var(--accent-glow);
}

.level-btn.locked {
  opacity: 0.4;
  cursor: not-allowed;
}

.level-num {
  font-size: 1.1rem;
  font-weight: 700;
}

.level-name {
  font-size: 0.65rem;
  color: var(--text-secondary);
}

.level-stars {
  font-size: 0.6rem;
  color: #eab308;
  letter-spacing: 1px;
}

.close-btn {
  padding: 8px 24px;
  border-radius: 8px;
  border: 1px solid var(--border-color);
  background: var(--bg-secondary);
  color: var(--text-primary);
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s;
}

.close-btn:hover {
  border-color: var(--accent);
}

.win-modal .win-icon {
  font-size: 3rem;
  margin-bottom: 12px;
}

.star-rating {
  font-size: 2rem;
  margin: 8px 0 12px;
}

.star {
  color: #374151;
  transition: color 0.3s;
}

.star.filled {
  color: #eab308;
  text-shadow: 0 0 12px rgba(234, 179, 8, 0.5);
}

.win-desc {
  color: var(--text-secondary);
  margin-bottom: 8px;
}

.win-perfect {
  color: #eab308;
  font-weight: 600;
  margin-bottom: 12px;
}

.win-tip {
  color: var(--text-secondary);
  font-size: 0.8rem;
  margin-bottom: 12px;
}

.win-actions {
  display: flex;
  gap: 10px;
  justify-content: center;
}

.btn {
  padding: 8px 20px;
  border-radius: 8px;
  border: none;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary {
  background: linear-gradient(135deg, #06b6d4, #0891b2);
  color: white;
}

.btn-primary:hover {
  box-shadow: 0 0 16px var(--accent-glow);
}

.btn-secondary {
  background: var(--bg-secondary);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
}

.btn-secondary:hover {
  border-color: var(--accent);
}
</style>
