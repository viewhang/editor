<template>
  <template v-if="visibleCommands.length > 0">
    <div class="umo-bubble-menu-divider"></div>
    <menus-button
      menu-type="dropdown"
      overlay-class-name="umo-ai-assistant-dropdown"
      :tooltip="t('ai.text')"
      :disabled="loading"
      :hide-after-item-click="false"
      :popup-props="assistantPopupProps"
      :min-column-width="520"
      :max-column-width="600"
    >
      <span class="umo-ai-trigger">
        <span class="umo-ai-trigger-icon">
          <icon v-if="loading" class="loading" name="loading" />
          <icon v-else name="ai" />
        </span>
        <span class="umo-ai-trigger-text">{{ t('ai.text') }}</span>
      </span>
      <template #dropmenu>
        <t-dropdown-menu>
          <t-dropdown-item
            class="umo-ai-assistant-panel-item"
            value="assistant-panel"
          >
            <div class="umo-ai-assistant-panel" @click.stop @mousedown.stop>
              <div class="umo-ai-assistant-prompt">
                <span class="umo-ai-assistant-avatar">
                  <icon v-if="loading" class="loading" name="loading" />
                  <icon v-else name="ai" />
                </span>
                <input
                  ref="inputRef"
                  v-model="assistantInput"
                  class="umo-ai-assistant-input"
                  type="text"
                  :maxlength="assistantMaxlength || undefined"
                  :placeholder="assistantPlaceholder"
                  :disabled="loading"
                  autofocus
                  @keydown.enter.exact.prevent="submitCommand()"
                  @keydown.meta.enter.prevent="submitCommand()"
                  @keydown.ctrl.enter.prevent="submitCommand()"
                  @keydown.esc.stop.prevent="closeAssistantPanel"
                />
                <button
                  class="umo-ai-assistant-submit"
                  type="button"
                  :title="t('ai.generate')"
                  :disabled="!canSubmit"
                  @click.stop="submitCommand()"
                >
                  <icon v-if="loading" class="loading" name="loading" />
                  <icon v-else name="check" />
                </button>
              </div>
              <div class="umo-ai-assistant-commands">
                <div class="umo-ai-assistant-commands-header">
                  <span>{{ t('ai.commonCommands') }}</span>
                </div>
                <div class="umo-ai-assistant-chips">
                  <button
                    v-for="command in visibleCommands"
                    :key="getAssistantCommandLabel(command, l)"
                    class="umo-ai-assistant-chip"
                    type="button"
                    :class="{
                      active: selectedCommand === command,
                    }"
                    :disabled="loading"
                    @click="selectCommand(command)"
                  >
                    {{ getAssistantCommandLabel(command, l) }}
                  </button>
                </div>
              </div>
              <div
                v-if="showResult"
                class="umo-ai-assistant-result"
              >
                <div class="umo-ai-assistant-result-title">
                  {{ t('ai.generatedResult') }}
                </div>
                <div class="umo-ai-assistant-result-content">
                  {{ assistantResult }}
                </div>
                <div class="umo-ai-assistant-result-actions">
                  <button
                    class="umo-ai-assistant-action primary"
                    type="button"
                    :disabled="!canApplyResult"
                    @click="applyResult('replace')"
                  >
                    <icon name="check" />
                    <span>{{ t('ai.replaceSelection') }}</span>
                  </button>
                  <button
                    class="umo-ai-assistant-action"
                    type="button"
                    :disabled="!canApplyResult"
                    @click="applyResult('before')"
                  >
                    <icon name="outdent" />
                    <span>{{ t('ai.insertBefore') }}</span>
                  </button>
                  <button
                    class="umo-ai-assistant-action"
                    type="button"
                    :disabled="!canApplyResult"
                    @click="applyResult('after')"
                  >
                    <icon name="indent" />
                    <span>{{ t('ai.insertAfter') }}</span>
                  </button>
                  <span class="umo-ai-assistant-action-spacer"></span>
                  <button
                    class="umo-ai-assistant-icon-action"
                    type="button"
                    :title="t('ai.copyResult')"
                    :disabled="!assistantResult"
                    @click="copyAssistantResult"
                  >
                    <icon name="copy" />
                  </button>
                  <button
                    class="umo-ai-assistant-icon-action"
                    type="button"
                    :title="t('ai.regenerate')"
                    :disabled="loading"
                    @click="regenerateAssistantResult"
                  >
                    <icon name="reload" />
                  </button>
                  <button
                    class="umo-ai-assistant-icon-action"
                    type="button"
                    :title="t('ai.exit')"
                    @click="closeAssistantPanel"
                  >
                    <icon name="exit" />
                  </button>
                </div>
              </div>
            </div>
          </t-dropdown-item>
        </t-dropdown-menu>
      </template>
    </menus-button>
  </template>
</template>

<script setup>
import { l, t } from '@/composables/i18n'
import {
  getAssistantCommandLabel,
  getAssistantCommandValue,
} from '@/utils/assistant'

const editor = inject('editor')
const options = inject('options')
const container = inject('container')
const runAssistantCommand = inject('runAssistantCommand')
const applyAssistantOutput = inject('applyAssistantOutput')
const resetAssistantState = inject('resetAssistantState')
const assistantState = inject('assistantState', ref({ loading: false }))

const inputRef = ref(null)
const selectedCommand = ref(null)
const lastSubmittedCommand = ref(null)
const assistantInput = ref('')
const assistantPanelVisible = ref(false)

const assistant = computed(() => options.value.ai?.assistant)
const assistantMaxlength = computed(() => assistant.value?.maxlength || 0)
const assistantPlaceholder = computed(() => {
  return l(assistant.value?.placeholder) || '输入或选择指令...'
})

const visibleCommands = computed(() => {
  if (!assistant.value?.enabled || !editor.value || editor.value.state.selection.empty) {
    return []
  }
  return Array.isArray(assistant.value.commands) ? assistant.value.commands : []
})

const loading = computed(() => assistantState.value.loading)
const assistantResult = computed(() => {
  return assistantState.value.preview || assistantState.value.result || ''
})
const showResult = computed(() => loading.value || !!assistantResult.value)
const canApplyResult = computed(() => {
  return !!assistantState.value.result && !!assistantState.value.range && !loading.value
})
const inputTooLong = computed(() => {
  return assistantMaxlength.value > 0 && assistantInput.value.length > assistantMaxlength.value
})
const canSubmit = computed(() => {
  return !loading.value && assistantInput.value.trim().length > 0 && !inputTooLong.value
})
const assistantPopupProps = computed(() => ({
  visible: assistantPanelVisible.value,
  onVisibleChange: handleAssistantVisibleChange,
}))

const focusInput = () => {
  nextTick(() => {
    inputRef.value?.focus?.()
  })
}

const clearInput = () => {
  selectedCommand.value = null
  lastSubmittedCommand.value = null
  assistantInput.value = ''
}

const resetPanel = () => {
  clearInput()
  resetAssistantState?.()
}

function handleAssistantVisibleChange(visible) {
  assistantPanelVisible.value = visible
  if (visible) {
    focusInput()
    return
  }
  resetPanel()
}

const closeAssistantPanel = () => {
  assistantPanelVisible.value = false
  resetPanel()
}

const selectCommand = (command) => {
  selectedCommand.value = command
  assistantInput.value = getAssistantCommandValue(command, l)
  if (command.autoSend !== false) {
    submitCommand(command)
    return
  }
  focusInput()
}

const submitCommand = async (commandArg) => {
  if (!canSubmit.value) {
    return
  }
  const input = assistantInput.value.trim()
  const command = commandArg || selectedCommand.value || visibleCommands.value[0] || {
    label: input,
    value: input,
  }
  selectedCommand.value = command
  lastSubmittedCommand.value = command
  await runAssistantCommand?.(command, input)
}

const applyResult = (mode) => {
  if (applyAssistantOutput?.(mode)) {
    assistantPanelVisible.value = false
    resetPanel()
  }
}

const copyAssistantResult = async () => {
  if (!assistantResult.value) {
    return
  }
  try {
    const { copy } = useClipboard({ source: assistantResult })
    await copy()
    useMessage('success', {
      attach: container,
      content: t('ai.copied'),
    })
  } catch {
    useMessage('error', {
      attach: container,
      content: t('copy.copyFailed'),
    })
  }
}

const regenerateAssistantResult = () => {
  const command = lastSubmittedCommand.value ||
    assistantState.value.commandConfig ||
    selectedCommand.value
  if (!command) {
    return
  }
  if (!assistantInput.value.trim()) {
    assistantInput.value = assistantState.value.commandOverride ||
      getAssistantCommandValue(command, l)
  }
  submitCommand(command)
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
      animation: umo-ai-assistant-spin 1s linear infinite;
    }
  }

  &-text {
    font-size: 12px;
    color: var(--umo-text-color);
    white-space: nowrap;
  }
}

.umo-ai-assistant-dropdown {
  .umo-dropdown {
    padding: 0;
  }

  .umo-ai-assistant-panel-item {
    padding: 0 !important;
    cursor: default;
    width: min(600px, calc(100vw - 24px)) !important;
    min-width: min(520px, calc(100vw - 24px)) !important;
    max-width: min(600px, calc(100vw - 24px)) !important;

    &:hover {
      background: transparent;
    }

    .umo-dropdown__item-text {
      width: 100%;
      max-width: none !important;
      padding: 0 !important;
    }
  }
}

.umo-ai-assistant-panel {
  width: 100%;
  padding: 0;
  box-sizing: border-box;
  color: var(--umo-text-color);
}

.umo-ai-assistant-prompt,
.umo-ai-assistant-commands {
  border: 1px solid var(--umo-primary-color);
  border-radius: 4px;
  background: var(--umo-color-white);
}

.umo-ai-assistant-prompt {
  display: flex;
  align-items: center;
  min-height: 42px;
  padding: 0 10px;
  box-sizing: border-box;
}

.umo-ai-assistant-avatar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
  width: 24px;
  height: 24px;
  margin-right: 8px;
  border-radius: 50%;
  color: #fff;
  background: var(--umo-primary-color);
  font-size: 15px;

  .umo-icon {
    width: 15px;
    height: 15px;
  }

  .loading {
    animation: umo-ai-assistant-spin 1s linear infinite;
  }
}

.umo-ai-assistant-input {
  min-width: 0;
  flex: 1;
  border: 0;
  outline: none;
  background: transparent;
  color: var(--umo-text-color);
  font: inherit;
  font-size: 13px;
  line-height: 20px;

  &::placeholder {
    color: var(--umo-text-color-light);
  }

  &:disabled {
    cursor: not-allowed;
  }
}

.umo-ai-assistant-submit,
.umo-ai-assistant-icon-action {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
  width: 28px;
  height: 28px;
  border: 0;
  border-radius: 4px;
  background: transparent;
  color: var(--umo-text-color-light);
  cursor: pointer;

  &:hover:not(:disabled) {
    color: var(--umo-primary-color);
    background: var(--umo-button-hover-background);
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.45;
  }

  .umo-icon {
    width: 16px;
    height: 16px;
  }

  .loading {
    animation: umo-ai-assistant-spin 1s linear infinite;
  }
}

.umo-ai-assistant-submit {
  margin-left: 8px;
  color: var(--umo-primary-color);
  background: color-mix(in srgb, var(--umo-primary-color) 12%, transparent);
}

.umo-ai-assistant-commands {
  margin-top: 6px;
  padding: 9px 10px 10px;
}

.umo-ai-assistant-commands-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
  color: var(--umo-text-color-light);
  font-size: 12px;
  line-height: 18px;
}

.umo-ai-assistant-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.umo-ai-assistant-chip {
  min-height: 26px;
  padding: 1px 10px;
  border: 1px solid var(--umo-border-color);
  border-radius: 4px;
  background: var(--umo-color-white);
  color: var(--umo-text-color);
  font: inherit;
  font-size: 13px;
  line-height: 20px;
  cursor: pointer;

  &:hover:not(:disabled),
  &.active {
    border-color: var(--umo-primary-color);
    color: var(--umo-primary-color);
    background: color-mix(in srgb, var(--umo-primary-color) 10%, transparent);
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.55;
  }
}

.umo-ai-assistant-result {
  margin-top: 6px;
  padding: 10px;
  border: 1px solid var(--umo-primary-color);
  border-radius: 4px;
  background: var(--umo-color-white);
}

.umo-ai-assistant-result-title {
  margin-bottom: 8px;
  color: var(--umo-text-color-light);
  font-size: 12px;
  line-height: 18px;
}

.umo-ai-assistant-result-content {
  max-height: 220px;
  overflow: auto;
  color: var(--umo-text-color);
  font-size: 13px;
  line-height: 1.65;
  white-space: pre-wrap;
}

.umo-ai-assistant-result-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 10px;
}

.umo-ai-assistant-action {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  min-height: 30px;
  padding: 3px 10px;
  border: 1px solid var(--umo-border-color);
  border-radius: 4px;
  background: var(--umo-color-white);
  color: var(--umo-text-color);
  font: inherit;
  font-size: 13px;
  line-height: 20px;
  cursor: pointer;

  &.primary {
    border-color: var(--umo-primary-color);
    color: #fff;
    background: var(--umo-primary-color);
  }

  &:hover:not(:disabled) {
    border-color: var(--umo-primary-color);
    color: var(--umo-primary-color);
    background: color-mix(in srgb, var(--umo-primary-color) 10%, transparent);

    &.primary {
      color: #fff;
      background: var(--umo-primary-color);
      opacity: 0.9;
    }
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }

  .umo-icon {
    width: 15px;
    height: 15px;
  }
}

.umo-ai-assistant-action-spacer {
  flex: 1;
  min-width: 4px;
}

@keyframes umo-ai-assistant-spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}
</style>
