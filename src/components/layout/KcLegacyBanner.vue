<template>
  <transition name="kc-legacy-slide">
    <div v-if="!dismissed" class="kc-legacy">
      <div class="kc-legacy__inner">
        <span class="kc-legacy__icon" aria-hidden="true">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 3l9 16H3zM12 9v5M12 17h.01" /></svg>
        </span>
        <div class="kc-legacy__text">
          <strong>This is the new BestKeystone.</strong>
          Not feeling the redesign? The classic site is still around for now — we'll retire it soon, but until then you can switch back.
        </div>
        <a class="kc-legacy__btn" :href="LEGACY_URL">Use the classic site →</a>
        <button class="kc-legacy__close" type="button" aria-label="Dismiss" @click="dismiss">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
        </button>
      </div>
    </div>
  </transition>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const LEGACY_URL = 'https://legacy.bestkeystone.com'
const KEY = 'kc-legacy-banner-dismissed'

const dismissed = ref<boolean>((() => {
  try { return localStorage.getItem(KEY) === '1' } catch (e) { return false }
})())

function dismiss() {
  dismissed.value = true
  try { localStorage.setItem(KEY, '1') } catch (e) { /* noop */ }
}
</script>

<style scoped>
.kc-legacy {
  position: fixed;
  left: 0; right: 0; bottom: 0;
  z-index: 2000;
  background: var(--bg-raised);
  border-top: 2px solid var(--warn);
  box-shadow: 0 -8px 24px rgba(0, 0, 0, 0.45);
}
.kc-legacy__inner {
  width: 100%;
  max-width: var(--content-wide);
  margin: 0 auto;
  padding: 12px 24px;
  display: flex;
  align-items: center;
  gap: 16px;
}
.kc-legacy__icon { color: var(--warn); flex: none; display: grid; place-items: center; }
.kc-legacy__text { flex: 1; min-width: 0; font-size: 13px; color: var(--text-mid); line-height: 1.45; }
.kc-legacy__text strong { color: var(--text-hi); font-weight: 600; }

.kc-legacy__btn {
  flex: none;
  display: inline-flex; align-items: center; height: 36px; padding: 0 16px;
  border-radius: var(--radius-md);
  background: var(--warn); color: var(--text-inverse);
  font: 600 13px/1 var(--font-ui, inherit); text-decoration: none; white-space: nowrap;
  transition: filter 120ms ease;
}
.kc-legacy__btn:hover { filter: brightness(1.08); color: var(--text-inverse); }

.kc-legacy__close {
  flex: none;
  width: 32px; height: 32px; border-radius: var(--radius-md);
  background: transparent; border: 1px solid var(--line-default); color: var(--text-mid);
  cursor: pointer; display: grid; place-items: center;
}
.kc-legacy__close:hover { background: var(--bg-hover); color: var(--text-hi); }

.kc-legacy-slide-enter-active, .kc-legacy-slide-leave-active { transition: transform 220ms var(--ease-out, ease), opacity 180ms ease; }
.kc-legacy-slide-enter-from, .kc-legacy-slide-leave-to { transform: translateY(100%); opacity: 0; }

@media (max-width: 700px) {
  .kc-legacy__inner { flex-wrap: wrap; gap: 10px; padding: 12px 16px; }
  .kc-legacy__text { flex: 1 1 100%; order: 1; }
  .kc-legacy__btn { order: 2; }
  .kc-legacy__close { order: 3; margin-left: auto; }
  .kc-legacy__icon { display: none; }
}
</style>
