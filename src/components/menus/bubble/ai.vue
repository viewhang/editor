<template>
  <template v-if="visibleActions.length > 0">
    <div class="umo-bubble-menu-divider"></div>
    <menus-button
      menu-type="dropdown"
      overlay-class-name="umo-ai-actions-dropdown"
      :tooltip="buttonTooltip"
      :disabled="loading"
    >
      <span class="umo-ai-trigger">
        <span class="umo-ai-trigger-icon">
          <icon v-if="loading" class="loading" name="loading" />
          <icon v-else name="ai" />
        </span>
        <span class="umo-ai-trigger-text">{{ buttonLabel }}</span>
      </span>
      <template #dropmenu>
        <t-dropdown-menu>
          <t-dropdown-item
            v-for="action in visibleActions"
            :key="action.key"
            :disabled="loading"
            :divider="action.divider"
            @click="handleAction(action)"
          >
            <div class="umo-ai-dropdown-item">
              <div class="umo-ai-dropdown-item-title">
                <span class="umo-ai-dropdown-item-icon">
                  <icon
                    v-if="isActionRunning(action)"
                    class="loading"
                    name="loading"
                  />
                  <span
                    v-else-if="isSvgIcon(action.icon)"
                    class="umo-ai-action-icon-svg"
                    v-html="action.icon"
                  ></span>
                  <icon v-else :name="action.icon || 'ai'" />
                </span>
                <span>{{ getAiActionLabel(action) }}</span>
              </div>
              <div
                v-if="getAiActionDescription(action)"
                class="umo-ai-dropdown-item-desc"
              >
                {{ getAiActionDescription(action) }}
              </div>
            </div>
          </t-dropdown-item>
        </t-dropdown-menu>
      </template>
    </menus-button>
  </template>
</template>

<script setup>
import { isString } from '@tool-belt/type-predicates'

import { l, t } from '@/composables/i18n'
import {
  getAiActionDescription,
  getAiActionLabel,
  getVisibleAiActions,
} from '@/utils/ai'

const editor = inject('editor')
const options = inject('options')
const runAiAction = inject('runAiAction')
const aiActionState = inject('aiActionState', ref({ loading: false, key: '' }))

const visibleActions = computed(() => {
  return getVisibleAiActions({
    editorOptions: options.value,
    editor: editor.value,
    surface: 'bubble',
    readOnly: !!options.value.document?.readOnly,
  })
})

// 浮动菜单只保留一个 AI 入口，避免把所有能力平铺在外层菜单里。
const buttonLabel = computed(() => {
  return l(options.value.ai?.bubble?.label) || t('ai.text')
})

const buttonTooltip = computed(() => {
  return buttonLabel.value
})

const loading = computed(() => aiActionState.value.loading)

const isSvgIcon = (icon) => {
  return isString(icon) && icon.trim().startsWith('<')
}

const isActionRunning = (action) => {
  return aiActionState.value.loading && aiActionState.value.key === action.key
}

const handleAction = (action) => {
  runAiAction?.(action)
}
</script>

<style lang="less">
.umo-ai-trigger {
  display: inline-flex;
  align-items: center;
  gap: 6px;

  &-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;

    .loading {
      animation: umo-ai-action-spin 1s linear infinite;
    }
  }

  &-text {
    font-size: 12px;
    color: var(--umo-text-color);
    white-space: nowrap;
  }
}

.umo-ai-actions-dropdown {
  .umo-dropdown__item {
    max-width: 260px !important;
    align-items: flex-start;
  }
}

.umo-ai-dropdown-item {
  display: flex;
  flex-direction: column;
  gap: 3px;

  &-title {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    color: var(--umo-text-color);
    font-size: 13px;
  }

  &-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;

    .loading {
      animation: umo-ai-action-spin 1s linear infinite;
    }
  }

  &-desc {
    color: var(--umo-text-color-light);
    font-size: 12px;
    line-height: 1.4;
    white-space: normal;
  }
}

.umo-ai-action-icon-svg {
  display: inline-flex;

  svg {
    width: 16px;
    height: 16px;
  }
}

@keyframes umo-ai-action-spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}
</style>
