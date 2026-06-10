<template>
  <div class="element-panel">
    <div class="panel-label">选择光学元件</div>
    <div class="element-groups">
      <div class="element-group">
        <div class="group-title">反光镜</div>
        <div class="element-options">
          <button
            v-if="isTypeAvailable('/')"
            class="el-btn mirror-forward"
            :class="{ active: selectedType === '/', disabled: isWon }"
            :disabled="isWon"
            @click="$emit('select', '/')"
            title="/ 型反光镜"
          >
            <span class="el-symbol">╱</span>
            <span class="el-label">/ 镜</span>
          </button>
          <button
            v-if="isTypeAvailable('\\')"
            class="el-btn mirror-backward"
            :class="{ active: selectedType === '\\', disabled: isWon }"
            :disabled="isWon"
            @click="$emit('select', '\\')"
            title="\\ 型反光镜"
          >
            <span class="el-symbol">╲</span>
            <span class="el-label">\ 镜</span>
          </button>
        </div>
      </div>

      <div v-if="hasAdvancedTypes" class="element-group">
        <div class="group-title">高级元件</div>
        <div class="element-options">
          <button
            v-if="isTypeAvailable('splitter')"
            class="el-btn splitter-btn"
            :class="{ active: selectedType === 'splitter', disabled: isWon }"
            :disabled="isWon"
            @click="$emit('select', 'splitter')"
            title="分光镜：一束光分为两束"
          >
            <span class="el-symbol">◐</span>
            <span class="el-label">分光镜</span>
          </button>
          <button
            v-if="isTypeAvailable('lens')"
            class="el-btn lens-btn"
            :class="{ active: selectedType === 'lens', disabled: isWon }"
            :disabled="isWon"
            @click="$emit('select', 'lens')"
            title="透镜：激光直线穿过"
          >
            <span class="el-symbol">◎</span>
            <span class="el-label">透镜</span>
          </button>
        </div>
      </div>

      <div v-if="hasFilterTypes" class="element-group">
        <div class="group-title">滤光片</div>
        <div class="element-options">
          <button
            v-if="isTypeAvailable('filter-red')"
            class="el-btn filter-red-btn"
            :class="{ active: selectedType === 'filter-red', disabled: isWon }"
            :disabled="isWon"
            @click="$emit('select', 'filter-red')"
            title="红色滤光片：激光变红"
          >
            <span class="el-symbol">🔴</span>
            <span class="el-label">红滤</span>
          </button>
          <button
            v-if="isTypeAvailable('filter-green')"
            class="el-btn filter-green-btn"
            :class="{ active: selectedType === 'filter-green', disabled: isWon }"
            :disabled="isWon"
            @click="$emit('select', 'filter-green')"
            title="绿色滤光片：激光变绿"
          >
            <span class="el-symbol">🟢</span>
            <span class="el-label">绿滤</span>
          </button>
          <button
            v-if="isTypeAvailable('filter-blue')"
            class="el-btn filter-blue-btn"
            :class="{ active: selectedType === 'filter-blue', disabled: isWon }"
            :disabled="isWon"
            @click="$emit('select', 'filter-blue')"
            title="蓝色滤光片：激光变蓝"
          >
            <span class="el-symbol">🔵</span>
            <span class="el-label">蓝滤</span>
          </button>
        </div>
      </div>
    </div>

    <div class="remaining-info">
      剩余 <strong :class="{ warn: remainingElements === 0 }">{{ remainingElements }}</strong> / {{ maxElements }} 个
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  maxElements: { type: Number, required: true },
  remainingElements: { type: Number, required: true },
  selectedType: { type: String, default: '/' },
  isWon: { type: Boolean, default: false },
  availableTypes: { type: Array, default: () => ['/', '\\'] },
})

defineEmits(['select'])

function isTypeAvailable(type) {
  return props.availableTypes.includes(type)
}

const hasAdvancedTypes = computed(() => {
  return props.availableTypes.some(t => t === 'splitter' || t === 'lens')
})

const hasFilterTypes = computed(() => {
  return props.availableTypes.some(t => t.startsWith('filter-'))
})
</script>

<style scoped>
.element-panel {
  display: flex;
  align-items: center;
  gap: 16px;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 12px 20px;
  flex-wrap: wrap;
}

.panel-label {
  font-size: 0.85rem;
  color: var(--text-secondary);
  white-space: nowrap;
}

.element-groups {
  display: flex;
  gap: 14px;
  flex-wrap: wrap;
}

.element-group {
  display: flex;
  align-items: center;
  gap: 6px;
}

.group-title {
  font-size: 0.7rem;
  color: var(--text-secondary);
  white-space: nowrap;
  margin-right: 2px;
}

.element-options {
  display: flex;
  gap: 6px;
}

.el-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  border-radius: 8px;
  border: 2px solid transparent;
  background: var(--bg-secondary);
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.8rem;
}

.el-btn:hover:not(:disabled) {
  border-color: var(--accent);
}

.el-btn.active {
  box-shadow: 0 0 10px rgba(6, 182, 212, 0.3);
}

.el-btn.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.mirror-forward.active {
  border-color: #f59e0b;
  background: rgba(245, 158, 11, 0.15);
  box-shadow: 0 0 10px rgba(245, 158, 11, 0.3);
}

.mirror-backward.active {
  border-color: #8b5cf6;
  background: rgba(139, 92, 246, 0.15);
  box-shadow: 0 0 10px rgba(139, 92, 246, 0.3);
}

.splitter-btn.active {
  border-color: #06b6d4;
  background: rgba(6, 182, 212, 0.15);
  box-shadow: 0 0 10px rgba(6, 182, 212, 0.3);
}

.lens-btn.active {
  border-color: #eab308;
  background: rgba(234, 179, 8, 0.15);
  box-shadow: 0 0 10px rgba(234, 179, 8, 0.3);
}

.filter-red-btn.active {
  border-color: #ef4444;
  background: rgba(239, 68, 68, 0.15);
  box-shadow: 0 0 10px rgba(239, 68, 68, 0.3);
}

.filter-green-btn.active {
  border-color: #22c55e;
  background: rgba(34, 197, 94, 0.15);
  box-shadow: 0 0 10px rgba(34, 197, 94, 0.3);
}

.filter-blue-btn.active {
  border-color: #3b82f6;
  background: rgba(59, 130, 246, 0.15);
  box-shadow: 0 0 10px rgba(59, 130, 246, 0.3);
}

.el-symbol {
  font-size: 1rem;
  font-weight: 700;
}

.mirror-forward .el-symbol { color: #f59e0b; }
.mirror-backward .el-symbol { color: #8b5cf6; }
.splitter-btn .el-symbol { color: #06b6d4; }
.lens-btn .el-symbol { color: #eab308; }

.el-label {
  font-size: 0.7rem;
  color: var(--text-secondary);
}

.remaining-info {
  font-size: 0.85rem;
  color: var(--text-secondary);
  white-space: nowrap;
  margin-left: auto;
}

.remaining-info strong {
  color: #f59e0b;
  font-size: 1rem;
}

.remaining-info strong.warn {
  color: var(--laser-color);
}
</style>
