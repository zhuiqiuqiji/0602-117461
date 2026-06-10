<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content knowledge-modal">
      <button class="close-x" @click="$emit('close')">✕</button>

      <div v-if="knowledgeId === 'reflection'" class="knowledge-card">
        <div class="kc-header reflection">
          <span class="kc-icon">🪞</span>
          <h2>反射定律</h2>
        </div>
        <div class="kc-body">
          <div class="kc-law">
            <p class="kc-statement">入射角 = 反射角</p>
            <p class="kc-detail">光线射到镜面时，入射光线、反射光线和法线在同一平面内，入射光线与反射光线分居法线两侧，入射角等于反射角。</p>
          </div>
          <div class="kc-demo">
            <svg viewBox="0 0 240 200" class="demo-svg">
              <line x1="40" y1="160" x2="200" y2="160" stroke="#4b5563" stroke-width="3" />
              <line x1="120" y1="160" x2="120" y2="30" stroke="#6b7280" stroke-width="1" stroke-dasharray="4,3" />
              <line x1="60" y1="60" x2="120" y2="160" stroke="#ef4444" stroke-width="2.5" />
              <line x1="120" y1="160" x2="180" y2="60" stroke="#ef4444" stroke-width="2.5" />
              <circle cx="120" cy="160" r="4" fill="#f59e0b" />
              <text x="85" y="100" fill="#ef4444" font-size="11">入射光</text>
              <text x="130" y="100" fill="#ef4444" font-size="11">反射光</text>
              <text x="125" y="50" fill="#6b7280" font-size="10">法线</text>
              <text x="80" y="175" fill="#9ca3af" font-size="10">镜面</text>
            </svg>
          </div>
          <div class="kc-interactive">
            <p class="kc-title">🎮 互动实验</p>
            <div class="slider-group">
              <label>入射角度: <strong>{{ reflectionAngle }}°</strong></label>
              <input type="range" min="10" max="80" v-model.number="reflectionAngle" />
            </div>
            <svg viewBox="0 0 240 200" class="demo-svg interactive">
              <line x1="40" y1="160" x2="200" y2="160" stroke="#4b5563" stroke-width="3" />
              <line x1="120" y1="160" x2="120" y2="30" stroke="#6b7280" stroke-width="1" stroke-dasharray="4,3" />
              <line x1="120" y1="160" :x2="120 - 80 * Math.sin(reflectionAngle * Math.PI / 180)" :y2="160 - 80 * Math.cos(reflectionAngle * Math.PI / 180)" stroke="#22c55e" stroke-width="2.5" />
              <line x1="120" y1="160" :x2="120 + 80 * Math.sin(reflectionAngle * Math.PI / 180)" :y2="160 - 80 * Math.cos(reflectionAngle * Math.PI / 180)" stroke="#06b6d4" stroke-width="2.5" />
              <circle cx="120" cy="160" r="4" fill="#f59e0b" />
              <text x="60" y="155" fill="#22c55e" font-size="10">入射</text>
              <text x="145" y="155" fill="#06b6d4" font-size="10">反射</text>
            </svg>
          </div>
        </div>
      </div>

      <div v-else-if="knowledgeId === 'splitter'" class="knowledge-card">
        <div class="kc-header splitter">
          <span class="kc-icon">◐</span>
          <h2>分光镜原理</h2>
        </div>
        <div class="kc-body">
          <div class="kc-law">
            <p class="kc-statement">一束光 → 两束光</p>
            <p class="kc-detail">分光镜（半透半反镜）将入射光分成两部分：一部分被反射改变方向，另一部分沿原方向穿过。这是干涉仪和光学通信的核心元件。</p>
          </div>
          <div class="kc-demo">
            <svg viewBox="0 0 240 180" class="demo-svg">
              <line x1="20" y1="90" x2="100" y2="90" stroke="#ef4444" stroke-width="2.5" />
              <line x1="100" y1="90" x2="200" y2="90" stroke="#ef4444" stroke-width="2" opacity="0.6" />
              <line x1="100" y1="90" x2="100" y2="20" stroke="#ef4444" stroke-width="2" opacity="0.6" />
              <rect x="88" y="78" width="24" height="24" rx="2" fill="none" stroke="#06b6d4" stroke-width="2" />
              <line x1="100" y1="78" x2="100" y2="102" stroke="#06b6d4" stroke-width="1.5" stroke-dasharray="3,2" />
              <text x="110" y="85" fill="#9ca3af" font-size="10">穿过</text>
              <text x="75" y="45" fill="#9ca3af" font-size="10">反射</text>
            </svg>
          </div>
        </div>
      </div>

      <div v-else-if="knowledgeId === 'filter'" class="knowledge-card">
        <div class="kc-header filter">
          <span class="kc-icon">🎨</span>
          <h2>滤光片与颜色</h2>
        </div>
        <div class="kc-body">
          <div class="kc-law">
            <p class="kc-statement">白光 → 单色光</p>
            <p class="kc-detail">滤光片利用选择性吸收，只允许特定波长的光通过。红色滤光片只通过红光，绿色滤光片只通过绿光。这就是为什么用红色激光穿过绿色滤光片会变绿！</p>
          </div>
          <div class="kc-demo">
            <svg viewBox="0 0 280 100" class="demo-svg">
              <line x1="10" y1="50" x2="90" y2="50" stroke="#ef4444" stroke-width="3" />
              <rect x="90" y="25" width="30" height="50" rx="3" fill="rgba(34,197,94,0.2)" stroke="#22c55e" stroke-width="2" stroke-dasharray="4,2" />
              <text x="100" y="55" fill="#22c55e" font-size="11" text-anchor="middle">G</text>
              <line x1="120" y1="50" x2="220" y2="50" stroke="#22c55e" stroke-width="3" />
              <text x="50" y="45" fill="#ef4444" font-size="10">红光</text>
              <text x="170" y="45" fill="#22c55e" font-size="10">绿光</text>
            </svg>
          </div>
        </div>
      </div>

      <div v-else-if="knowledgeId === 'fiber'" class="knowledge-card">
        <div class="kc-header fiber">
          <span class="kc-icon">🔗</span>
          <h2>光纤传输原理</h2>
        </div>
        <div class="kc-body">
          <div class="kc-law">
            <p class="kc-statement">全反射 → 远距传输</p>
            <p class="kc-detail">光纤利用光的全内反射原理，让光在纤芯中不断反射前进，实现远距离低损耗传输。现代互联网大部分数据都通过光纤传递！</p>
          </div>
          <div class="kc-demo">
            <svg viewBox="0 0 280 80" class="demo-svg">
              <rect x="40" y="25" width="200" height="30" rx="15" fill="rgba(168,85,247,0.1)" stroke="#a855f7" stroke-width="1.5" />
              <polyline points="50,40 70,30 90,50 110,30 130,50 150,30 170,50 190,30 210,50 230,40" fill="none" stroke="#a855f7" stroke-width="2" />
              <text x="50" y="20" fill="#a855f7" font-size="10">IN</text>
              <text x="220" y="20" fill="#a855f7" font-size="10">OUT</text>
            </svg>
          </div>
        </div>
      </div>

      <div v-else-if="knowledgeId === 'lens'" class="knowledge-card">
        <div class="kc-header lens">
          <span class="kc-icon">🔍</span>
          <h2>透镜与折射</h2>
        </div>
        <div class="kc-body">
          <div class="kc-law">
            <p class="kc-statement">折射定律 (斯涅尔定律)</p>
            <p class="kc-detail">n₁ sin θ₁ = n₂ sin θ₂。光从一种介质进入另一种介质时会发生偏折。凸透镜可以聚焦光线，凹透镜可以发散光线。在我们的游戏中，透镜让光直线穿过——简化模型。</p>
          </div>
          <div class="kc-demo">
            <svg viewBox="0 0 240 120" class="demo-svg">
              <line x1="10" y1="60" x2="100" y2="60" stroke="#ef4444" stroke-width="2.5" />
              <ellipse cx="120" cy="60" rx="8" ry="40" fill="rgba(234,179,8,0.15)" stroke="#eab308" stroke-width="2" />
              <line x1="140" y1="60" x2="230" y2="60" stroke="#ef4444" stroke-width="2.5" />
              <text x="30" y="55" fill="#9ca3af" font-size="10">入射</text>
              <text x="190" y="55" fill="#9ca3af" font-size="10">穿过</text>
            </svg>
          </div>
        </div>
      </div>

      <div v-else class="knowledge-card">
        <div class="kc-header">
          <h2>光学知识</h2>
        </div>
        <div class="kc-body">
          <p class="kc-detail">暂无对应知识卡片，继续探索更多关卡！</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

defineProps({
  knowledgeId: { type: String, default: null },
})

defineEmits(['close'])

const reflectionAngle = ref(45)
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
  padding: 32px;
  max-width: 480px;
  width: 90%;
  position: relative;
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

.close-x:hover {
  color: var(--text-primary);
}

.kc-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--border-color);
}

.kc-header.reflection { border-bottom-color: #f59e0b44; }
.kc-header.splitter { border-bottom-color: #06b6d444; }
.kc-header.filter { border-bottom-color: #22c55e44; }
.kc-header.fiber { border-bottom-color: #a855f744; }
.kc-header.lens { border-bottom-color: #eab30844; }

.kc-icon {
  font-size: 1.5rem;
}

.kc-header h2 {
  font-size: 1.3rem;
  color: var(--text-primary);
}

.kc-law {
  margin-bottom: 16px;
}

.kc-statement {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--accent);
  margin-bottom: 8px;
}

.kc-detail {
  font-size: 0.9rem;
  color: var(--text-secondary);
  line-height: 1.6;
}

.kc-demo {
  margin: 16px 0;
  display: flex;
  justify-content: center;
}

.demo-svg {
  width: 100%;
  max-width: 280px;
  background: rgba(17, 24, 39, 0.5);
  border-radius: 8px;
  padding: 8px;
}

.kc-interactive {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid var(--border-color);
}

.kc-title {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--accent);
  margin-bottom: 12px;
}

.slider-group {
  margin-bottom: 12px;
}

.slider-group label {
  font-size: 0.85rem;
  color: var(--text-secondary);
  display: block;
  margin-bottom: 6px;
}

.slider-group strong {
  color: var(--accent);
}

.slider-group input[type="range"] {
  width: 100%;
  accent-color: var(--accent);
}

.demo-svg.interactive {
  max-width: 240px;
}
</style>
