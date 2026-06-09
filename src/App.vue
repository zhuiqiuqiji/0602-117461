<template>
  <div class="game-container">
    <header class="game-header">
      <h1 class="game-title">⚡ 激光反射</h1>
      <StatusBar
        :level="currentLevel"
        :maxMirrors="maxMirrors"
        :remainingMirrors="remainingMirrors"
        :isWon="isWon"
        @reset="resetLevel"
        @next="nextLevel"
        @show-levels="showLevelSelect = true"
      />
    </header>

    <main class="game-main">
      <div class="board-wrapper">
        <GameBoard
          :cols="cols"
          :rows="rows"
          :emitter="emitter"
          :target="target"
          :mirrors="allMirrors"
          :laserPath="laserPath"
          :isWon="isWon"
          :preMirrorPositions="preMirrorPositions"
          @place-mirror="placeMirror"
          @remove-mirror="removeMirror"
        />
      </div>

      <MirrorPanel
        :maxMirrors="maxMirrors"
        :remainingMirrors="remainingMirrors"
        :selectedType="selectedMirrorType"
        :isWon="isWon"
        @select="selectMirrorType"
      />
    </main>

    <Teleport to="body">
      <div v-if="showLevelSelect" class="modal-overlay" @click.self="showLevelSelect = false">
        <div class="modal-content level-modal">
          <h2>选择关卡</h2>
          <div class="level-grid">
            <button
              v-for="lvl in levels"
              :key="lvl.id"
              class="level-btn"
              :class="{ active: lvl.id === currentLevel, locked: lvl.id > unlockedLevel }"
              :disabled="lvl.id > unlockedLevel"
              @click="loadLevel(lvl.id)"
            >
              <span class="level-num">{{ lvl.id }}</span>
              <span class="level-name">{{ lvl.name }}</span>
              <span v-if="lvl.id <= unlockedLevel && lvl.id < levels.length" class="level-check">✓</span>
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
          <p class="win-desc">你用 {{ placedMirrors.length }} 面反光镜完成了第 {{ currentLevel }} 关</p>
          <div class="win-actions">
            <button v-if="currentLevel < levels.length" class="btn btn-primary" @click="nextLevel(); showWinModal = false">下一关</button>
            <button class="btn btn-secondary" @click="resetLevel(); showWinModal = false">重玩</button>
            <button class="btn btn-secondary" @click="showWinModal = false">关闭</button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { levels } from './game/levels.js'
import { traceLaserPath, checkWin } from './game/laserEngine.js'
import GameBoard from './components/GameBoard.vue'
import StatusBar from './components/StatusBar.vue'
import MirrorPanel from './components/MirrorPanel.vue'

const currentLevel = ref(1)
const unlockedLevel = ref(1)
const selectedMirrorType = ref('/')
const placedMirrors = ref([])
const showLevelSelect = ref(false)
const showWinModal = ref(false)

const levelData = computed(() => levels.find(l => l.id === currentLevel.value) || levels[0])
const cols = computed(() => levelData.value.cols)
const rows = computed(() => levelData.value.rows)
const emitter = computed(() => levelData.value.emitter)
const target = computed(() => levelData.value.target)
const maxMirrors = computed(() => levelData.value.maxMirrors)
const preMirrorPositions = computed(() => levelData.value.preMirrors.map(m => `${m.x},${m.y}`))

const allMirrors = computed(() => {
  return [...levelData.value.preMirrors, ...placedMirrors.value]
})

const remainingMirrors = computed(() => maxMirrors.value - placedMirrors.value.length)

const laserPath = computed(() => {
  return traceLaserPath(emitter.value, allMirrors.value, cols.value, rows.value)
})

const isWon = computed(() => checkWin(laserPath.value, target.value))

watch(isWon, (won) => {
  if (won) {
    setTimeout(() => {
      showWinModal.value = true
      if (currentLevel.value >= unlockedLevel.value && currentLevel.value < levels.length) {
        unlockedLevel.value = currentLevel.value + 1
      }
    }, 400)
  }
}, { immediate: true })

function selectMirrorType(type) {
  selectedMirrorType.value = type
}

function placeMirror({ x, y }) {
  if (isWon.value) return
  const existing = placedMirrors.value.findIndex(m => m.x === x && m.y === y)
  if (existing >= 0) {
    placedMirrors.value[existing].type = selectedMirrorType.value
    placedMirrors.value = [...placedMirrors.value]
    return
  }
  if (remainingMirrors.value <= 0) return
  placedMirrors.value = [...placedMirrors.value, { x, y, type: selectedMirrorType.value }]
}

function removeMirror({ x, y }) {
  placedMirrors.value = placedMirrors.value.filter(m => !(m.x === x && m.y === y))
}

function resetLevel() {
  placedMirrors.value = []
  showWinModal.value = false
}

function nextLevel() {
  if (currentLevel.value < levels.length) {
    currentLevel.value++
    resetLevel()
  }
}

function loadLevel(id) {
  currentLevel.value = id
  resetLevel()
  showLevelSelect.value = false
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
  gap: 20px;
}

.board-wrapper {
  position: relative;
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
  max-width: 480px;
  width: 90%;
  text-align: center;
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
  gap: 4px;
  padding: 12px 8px;
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
  font-size: 1.2rem;
  font-weight: 700;
}

.level-name {
  font-size: 0.7rem;
  color: var(--text-secondary);
}

.level-check {
  position: absolute;
  top: 4px;
  right: 6px;
  color: var(--target-color);
  font-size: 0.8rem;
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

.win-desc {
  color: var(--text-secondary);
  margin-bottom: 20px;
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
