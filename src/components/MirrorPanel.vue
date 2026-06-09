<template>
  <div class="mirror-panel">
    <div class="panel-label">选择反光镜</div>
    <div class="mirror-options">
      <button
        class="mirror-btn forward"
        :class="{ active: selectedType === '/', disabled: isWon }"
        :disabled="isWon"
        @click="$emit('select', '/')"
        title="/ 型反光镜"
      >
        <span class="mirror-symbol">╱</span>
        <span class="mirror-label">/ 型</span>
      </button>
      <button
        class="mirror-btn backward"
        :class="{ active: selectedType === '\\', disabled: isWon }"
        :disabled="isWon"
        @click="$emit('select', '\\')"
        title="\\ 型反光镜"
      >
        <span class="mirror-symbol">╲</span>
        <span class="mirror-label">\ 型</span>
      </button>
    </div>
    <div class="remaining-info">
      剩余 <strong :class="{ warn: remainingMirrors === 0 }">{{ remainingMirrors }}</strong> / {{ maxMirrors }} 面
    </div>
  </div>
</template>

<script setup>
defineProps({
  maxMirrors: { type: Number, required: true },
  remainingMirrors: { type: Number, required: true },
  selectedType: { type: String, default: '/' },
  isWon: { type: Boolean, default: false },
})

defineEmits(['select'])
</script>

<style scoped>
.mirror-panel {
  display: flex;
  align-items: center;
  gap: 16px;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 12px 20px;
}

.panel-label {
  font-size: 0.85rem;
  color: var(--text-secondary);
  white-space: nowrap;
}

.mirror-options {
  display: flex;
  gap: 8px;
}

.mirror-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: 8px;
  border: 2px solid transparent;
  background: var(--bg-secondary);
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.2s;
}

.mirror-btn:hover:not(:disabled) {
  border-color: var(--accent);
}

.mirror-btn.forward.active {
  border-color: var(--mirror-forward);
  background: rgba(245, 158, 11, 0.15);
  box-shadow: 0 0 10px rgba(245, 158, 11, 0.3);
}

.mirror-btn.backward.active {
  border-color: var(--mirror-backward);
  background: rgba(139, 92, 246, 0.15);
  box-shadow: 0 0 10px rgba(139, 92, 246, 0.3);
}

.mirror-btn.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.mirror-symbol {
  font-size: 1.3rem;
  font-weight: 700;
}

.forward .mirror-symbol {
  color: var(--mirror-forward);
}

.backward .mirror-symbol {
  color: var(--mirror-backward);
}

.mirror-label {
  font-size: 0.8rem;
  color: var(--text-secondary);
}

.remaining-info {
  font-size: 0.85rem;
  color: var(--text-secondary);
  white-space: nowrap;
}

.remaining-info strong {
  color: var(--mirror-forward);
  font-size: 1rem;
}

.remaining-info strong.warn {
  color: var(--laser-color);
}
</style>
