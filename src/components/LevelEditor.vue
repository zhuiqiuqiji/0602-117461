<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content editor-modal">
      <button class="close-x" @click="$emit('close')">✕</button>
      <h2>🛠️ 关卡编辑器</h2>

      <div class="editor-layout">
        <div class="editor-board">
          <svg class="editor-svg" :viewBox="`0 0 ${editorCols * 50} ${editorRows * 50}`" xmlns="http://www.w3.org/2000/svg">
            <g v-for="row in editorRows" :key="'r' + row">
              <rect
                v-for="col in editorCols"
                :key="'c' + col"
                :x="(col - 1) * 50"
                :y="(row - 1) * 50"
                :width="50"
                :height="50"
                :class="editorCellClass(col - 1, row - 1)"
                @click="onEditorCellClick(col - 1, row - 1)"
              />
            </g>
            <g class="grid-lines">
              <line v-for="row in editorRows + 1" :key="'h' + row" x1="0" :y1="(row - 1) * 50" :x2="editorCols * 50" :y2="(row - 1) * 50" stroke="#2d3a52" stroke-width="0.5" />
              <line v-for="col in editorCols + 1" :key="'v' + col" :x1="(col - 1) * 50" y1="0" :x2="(col - 1) * 50" :y2="editorRows * 50" stroke="#2d3a52" stroke-width="0.5" />
            </g>

            <g v-for="em in editorEmitters" :key="'e-' + em.x + '-' + em.y">
              <circle :cx="em.x * 50 + 25" :cy="em.y * 50 + 25" r="10" :fill="getColorHex(em.color)" />
              <text :x="em.x * 50 + 25" :y="em.y * 50 + 29" text-anchor="middle" fill="white" font-size="10" font-weight="bold">E</text>
            </g>

            <g v-for="tg in editorTargets" :key="'t-' + tg.x + '-' + tg.y">
              <circle :cx="tg.x * 50 + 25" :cy="tg.y * 50 + 25" r="10" fill="none" :stroke="getColorHex(tg.color)" stroke-width="2" />
              <circle :cx="tg.x * 50 + 25" :cy="tg.y * 50 + 25" r="5" :fill="getColorHex(tg.color)" opacity="0.5" />
              <text :x="tg.x * 50 + 25" :y="tg.y * 50 + 29" text-anchor="middle" fill="white" font-size="9" font-weight="bold">T</text>
            </g>

            <g v-for="el in editorPreElements" :key="'p-' + el.x + '-' + el.y">
              <rect v-if="el.type !== 'fiber-in' && el.type !== 'fiber-out'" :x="el.x * 50 + 12" :y="el.y * 50 + 12" :width="26" :height="26" rx="3" fill="rgba(6,182,212,0.2)" stroke="#06b6d4" stroke-width="1.5" />
              <text v-if="el.type !== 'fiber-in' && el.type !== 'fiber-out'" :x="el.x * 50 + 25" :y="el.y * 50 + 29" text-anchor="middle" fill="#06b6d4" font-size="9">{{ getElementLabel(el.type) }}</text>

              <rect v-if="el.type === 'fiber-in'" :x="el.x * 50 + 8" :y="el.y * 50 + 8" :width="34" :height="34" rx="6" fill="rgba(168,85,247,0.2)" stroke="#a855f7" stroke-width="1.5" />
              <text v-if="el.type === 'fiber-in'" :x="el.x * 50 + 25" :y="el.y * 50 + 29" text-anchor="middle" fill="#a855f7" font-size="9" font-weight="bold">IN</text>

              <rect v-if="el.type === 'fiber-out'" :x="el.x * 50 + 8" :y="el.y * 50 + 8" :width="34" :height="34" rx="6" fill="rgba(168,85,247,0.1)" stroke="#a855f7" stroke-width="1.5" stroke-dasharray="3,2" />
              <text v-if="el.type === 'fiber-out'" :x="el.x * 50 + 25" :y="el.y * 50 + 29" text-anchor="middle" fill="#a855f7" font-size="8" font-weight="bold">OUT</text>
            </g>
          </svg>
        </div>

        <div class="editor-controls">
          <div class="control-group">
            <label>关卡名称</label>
            <input v-model="editorName" type="text" placeholder="我的关卡" class="input-field" />
          </div>

          <div class="control-row">
            <div class="control-group half">
              <label>列数</label>
              <input v-model.number="editorCols" type="number" min="4" max="12" class="input-field" />
            </div>
            <div class="control-group half">
              <label>行数</label>
              <input v-model.number="editorRows" type="number" min="4" max="12" class="input-field" />
            </div>
          </div>

          <div class="control-group">
            <label>放置模式</label>
            <div class="mode-btns">
              <button class="mode-btn" :class="{ active: editorMode === 'emitter' }" @click="editorMode = 'emitter'">发射器</button>
              <button class="mode-btn" :class="{ active: editorMode === 'target' }" @click="editorMode = 'target'">接收器</button>
              <button class="mode-btn" :class="{ active: editorMode === 'element' }" @click="editorMode = 'element'">元件</button>
              <button class="mode-btn" :class="{ active: editorMode === 'delete' }" @click="editorMode = 'delete'">删除</button>
            </div>
          </div>

          <div v-if="editorMode === 'emitter'" class="control-group">
            <label>发射方向</label>
            <div class="dir-btns">
              <button class="dir-btn" :class="{ active: editorDirection === 'UP' }" @click="editorDirection = 'UP'">↑</button>
              <button class="dir-btn" :class="{ active: editorDirection === 'DOWN' }" @click="editorDirection = 'DOWN'">↓</button>
              <button class="dir-btn" :class="{ active: editorDirection === 'LEFT' }" @click="editorDirection = 'LEFT'">←</button>
              <button class="dir-btn" :class="{ active: editorDirection === 'RIGHT' }" @click="editorDirection = 'RIGHT'">→</button>
            </div>
          </div>

          <div v-if="editorMode === 'emitter' || editorMode === 'target'" class="control-group">
            <label>颜色</label>
            <div class="color-btns">
              <button class="color-btn" :class="{ active: editorColor === 'red' }" style="background:#ef4444" @click="editorColor = 'red'"></button>
              <button class="color-btn" :class="{ active: editorColor === 'green' }" style="background:#22c55e" @click="editorColor = 'green'"></button>
              <button class="color-btn" :class="{ active: editorColor === 'blue' }" style="background:#3b82f6" @click="editorColor = 'blue'"></button>
            </div>
          </div>

          <div v-if="editorMode === 'element'" class="control-group">
            <label>元件类型</label>
            <select v-model="editorElementType" class="input-field">
              <option value="/">/ 型反光镜</option>
              <option value="\">\ 型反光镜</option>
              <option value="splitter">分光镜</option>
              <option value="lens">透镜</option>
              <option value="filter-red">红色滤光片</option>
              <option value="filter-green">绿色滤光片</option>
              <option value="filter-blue">蓝色滤光片</option>
              <option value="fiber-in">光纤入口</option>
              <option value="fiber-out">光纤出口</option>
            </select>
          </div>

          <div v-if="editorMode === 'element' && (editorElementType === 'fiber-in' || editorElementType === 'fiber-out')" class="control-group">
            <label>光纤配对 ID</label>
            <input v-model="editorFiberPairId" type="text" placeholder="f1, f2..." class="input-field" />
          </div>

          <div v-if="editorMode === 'element' && editorElementType === 'fiber-out'" class="control-group">
            <label>出口方向</label>
            <div class="dir-btns">
              <button class="dir-btn" :class="{ active: editorFiberDirection === 'UP' }" @click="editorFiberDirection = 'UP'">↑</button>
              <button class="dir-btn" :class="{ active: editorFiberDirection === 'DOWN' }" @click="editorFiberDirection = 'DOWN'">↓</button>
              <button class="dir-btn" :class="{ active: editorFiberDirection === 'LEFT' }" @click="editorFiberDirection = 'LEFT'">←</button>
              <button class="dir-btn" :class="{ active: editorFiberDirection === 'RIGHT' }" @click="editorFiberDirection = 'RIGHT'">→</button>
            </div>
          </div>

          <div class="control-group">
            <label>最大可放置元件数</label>
            <input v-model.number="editorMaxElements" type="number" min="0" max="20" class="input-field" />
          </div>

          <div class="control-group">
            <label>最优元件数 (三星标准)</label>
            <input v-model.number="editorOptimal" type="number" min="0" max="20" class="input-field" />
          </div>

          <div class="control-actions">
            <button class="btn btn-primary" @click="exportLevel" :disabled="!canExport">开始游戏</button>
            <button class="btn btn-secondary" @click="shareLevel">复制分享码</button>
            <button class="btn btn-secondary" @click="importLevel">导入分享码</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { LASER_COLORS } from '../game/laserEngine.js'

const emit = defineEmits(['close', 'play-custom'])

const editorName = ref('自定义关卡')
const editorCols = ref(8)
const editorRows = ref(8)
const editorMode = ref('emitter')
const editorDirection = ref('RIGHT')
const editorColor = ref('red')
const editorElementType = ref('/')
const editorFiberPairId = ref('f1')
const editorFiberDirection = ref('RIGHT')
const editorMaxElements = ref(5)
const editorOptimal = ref(3)
const editorEmitters = ref([])
const editorTargets = ref([])
const editorPreElements = ref([])

function getColorHex(color) {
  return LASER_COLORS[color] || '#ef4444'
}

function getElementLabel(type) {
  const labels = {
    '/': '╱', '\\': '╲', splitter: '分', lens: '透',
    'filter-red': 'R', 'filter-green': 'G', 'filter-blue': 'B',
    'fiber-in': 'IN', 'fiber-out': 'OUT',
  }
  return labels[type] || type
}

function editorCellClass(x, y) {
  const isEmitter = editorEmitters.value.some(e => e.x === x && e.y === y)
  const isTarget = editorTargets.value.some(t => t.x === x && t.y === y)
  return {
    'editor-cell': true,
    'cell-emitter': isEmitter,
    'cell-target': isTarget,
  }
}

function onEditorCellClick(x, y) {
  if (editorMode.value === 'delete') {
    editorEmitters.value = editorEmitters.value.filter(e => !(e.x === x && e.y === y))
    editorTargets.value = editorTargets.value.filter(t => !(t.x === x && t.y === y))
    editorPreElements.value = editorPreElements.value.filter(e => !(e.x === x && e.y === y))
    return
  }

  if (editorMode.value === 'emitter') {
    editorEmitters.value = editorEmitters.value.filter(e => !(e.x === x && e.y === y))
    editorEmitters.value = [...editorEmitters.value, { x, y, direction: editorDirection.value, color: editorColor.value }]
  } else if (editorMode.value === 'target') {
    editorTargets.value = editorTargets.value.filter(t => !(t.x === x && t.y === y))
    editorTargets.value = [...editorTargets.value, { x, y, direction: 'LEFT', color: editorColor.value }]
  } else if (editorMode.value === 'element') {
    editorPreElements.value = editorPreElements.value.filter(e => !(e.x === x && e.y === y))
    const newEl = { x, y, type: editorElementType.value }
    if (editorElementType.value === 'fiber-in' || editorElementType.value === 'fiber-out') {
      newEl.pairId = editorFiberPairId.value
    }
    if (editorElementType.value === 'fiber-out') {
      newEl.direction = editorFiberDirection.value
    }
    editorPreElements.value = [...editorPreElements.value, newEl]
  }
}

const canExport = computed(() => {
  return editorEmitters.value.length > 0 && editorTargets.value.length > 0 && editorName.value.trim()
})

function exportLevel() {
  if (!canExport.value) return
  const levelData = {
    name: editorName.value,
    cols: editorCols.value,
    rows: editorRows.value,
    emitters: editorEmitters.value,
    targets: editorTargets.value,
    walls: [],
    preElements: editorPreElements.value,
    maxElements: editorMaxElements.value,
    optimalElements: editorOptimal.value,
    hint: `自定义关卡: ${editorName.value}`,
    knowledgeId: null,
    availableTypes: ['/', '\\', 'splitter', 'lens', 'filter-red', 'filter-green', 'filter-blue', 'fiber-in', 'fiber-out'],
  }
  emit('play-custom', levelData)
}

function shareLevel() {
  const data = {
    n: editorName.value,
    c: editorCols.value,
    r: editorRows.value,
    e: editorEmitters.value,
    t: editorTargets.value,
    p: editorPreElements.value,
    m: editorMaxElements.value,
    o: editorOptimal.value,
  }
  const code = btoa(JSON.stringify(data))
  navigator.clipboard.writeText(code).then(() => {
    alert('分享码已复制到剪贴板！')
  }).catch(() => {
    prompt('复制以下分享码：', code)
  })
}

function importLevel() {
  const code = prompt('粘贴分享码：')
  if (!code) return
  try {
    const data = JSON.parse(atob(code))
    editorName.value = data.n || '导入关卡'
    editorCols.value = data.c || 8
    editorRows.value = data.r || 8
    editorEmitters.value = data.e || []
    editorTargets.value = data.t || []
    editorPreElements.value = data.p || []
    editorMaxElements.value = data.m || 5
    editorOptimal.value = data.o || 3
  } catch {
    alert('无效的分享码')
  }
}
</script>

<style scoped>
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
  padding: 28px;
  max-width: 720px;
  width: 95%;
  position: relative;
  max-height: 90vh;
  overflow-y: auto;
}

.close-x {
  position: absolute;
  top: 12px;
  right: 16px;
  background: none;
  border: none;
  color: var(--text-secondary);
  font-size: 1.2rem;
  cursor: pointer;
}

.modal-content h2 {
  font-size: 1.3rem;
  margin-bottom: 16px;
  color: var(--text-primary);
}

.editor-layout {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
}

.editor-board {
  flex-shrink: 0;
}

.editor-svg {
  display: block;
  background: var(--bg-secondary);
  border-radius: 8px;
  border: 1px solid var(--border-color);
  width: 400px;
  max-width: 100%;
}

.editor-cell {
  fill: var(--bg-secondary);
  cursor: pointer;
  transition: fill 0.15s;
}

.editor-cell:hover {
  fill: rgba(6, 182, 212, 0.15);
}

.cell-emitter {
  fill: rgba(239, 68, 68, 0.1);
}

.cell-target {
  fill: rgba(34, 197, 94, 0.1);
}

.editor-controls {
  flex: 1;
  min-width: 200px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.control-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.control-group label {
  font-size: 0.75rem;
  color: var(--text-secondary);
}

.control-row {
  display: flex;
  gap: 10px;
}

.control-group.half {
  flex: 1;
}

.input-field {
  padding: 6px 10px;
  border-radius: 6px;
  border: 1px solid var(--border-color);
  background: var(--bg-secondary);
  color: var(--text-primary);
  font-size: 0.85rem;
}

.input-field:focus {
  outline: none;
  border-color: var(--accent);
}

.mode-btns, .dir-btns {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}

.mode-btn, .dir-btn {
  padding: 5px 10px;
  border-radius: 6px;
  border: 1px solid var(--border-color);
  background: var(--bg-secondary);
  color: var(--text-primary);
  cursor: pointer;
  font-size: 0.8rem;
  transition: all 0.15s;
}

.mode-btn.active, .dir-btn.active {
  border-color: var(--accent);
  background: rgba(6, 182, 212, 0.15);
  color: var(--accent);
}

.color-btns {
  display: flex;
  gap: 6px;
}

.color-btn {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 2px solid transparent;
  cursor: pointer;
  transition: all 0.15s;
}

.color-btn.active {
  border-color: white;
  box-shadow: 0 0 8px rgba(255, 255, 255, 0.3);
}

.control-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: 8px;
}

.btn {
  padding: 8px 16px;
  border-radius: 8px;
  border: none;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s;
}

.btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.btn-primary {
  background: linear-gradient(135deg, #06b6d4, #0891b2);
  color: white;
}

.btn-primary:hover:not(:disabled) {
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
