<template>
  <template v-if="visibleCommands.length > 0">
    <div class="umo-bubble-menu-divider"></div>
    <menus-button
      menu-type="dropdown"
      overlay-class-name="umo-ai-assistant-dropdown"
      :tooltip="t('ai.text')"
      :disabled="loading"
    >
      <span class="umo-ai-trigger">
        <span class="umo-ai-trigger-icon">
          <icon v-if="loading" class="loading" name="loading" />
          <icon v-else name="ai" />
        </span>
        <span class="umo-ai-trigger-text">{{ t('ai.text') }}</span>
      </span>
      <template #dropmenu>
        <div class="umo-ai-assistant-menu">
          <button
            v-for="command in visibleCommands"
            :key="getAssistantCommandLabel(command, l)"
            class="umo-ai-assistant-menu-item"
            type="button"
            :disabled="loading"
            @click.stop="handleCommand(command)"
          >
            {{ getAssistantCommandLabel(command, l) }}
          </button>
        </div>
        <div
          v-if="pendingCommand"
          class="umo-ai-assistant-input"
          @click.stop
        >
          <t-textarea
            v-model="assistantInput"
            :autosize="{ minRows: 2, maxRows: 4 }"
            :maxlength="assistantMaxlength"
            :placeholder="l(assistant?.placeholder)"
          />
          <div class="umo-ai-assistant-input-actions">
            <t-button
              size="small"
              theme="default"
              variant="text"
              :disabled="loading"
              @click="cancelCommand"
            >
              {{ t('dialog.cancel') }}
            </t-button>
            <t-button
              size="small"
              theme="primary"
              :disabled="loading || !assistantInput.trim() || inputTooLong"
              @click="submitCommand"
            >
              {{ t('dialog.confirm') }}
            </t-button>
          </div>
        </div>
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
const runAssistantCommand = inject('runAssistantCommand')
const assistantState = inject('assistantState', ref({ loading: false }))

const pendingCommand = ref(null)
const assistantInput = ref('')

const assistant = computed(() => options.value.ai?.assistant)
const assistantMaxlength = computed(() => assistant.value?.maxlength || 0)

const visibleCommands = computed(() => {
  if (!assistant.value?.enabled || !editor.value || editor.value.state.selection.empty) {
    return []
  }
  return Array.isArray(assistant.value.commands) ? assistant.value.commands : []
})

const loading = computed(() => assistantState.value.loading)
const inputTooLong = computed(() => {
  return assistantMaxlength.value > 0 && assistantInput.value.length > assistantMaxlength.value
})

const handleCommand = (command) => {
  if (command.autoSend === false) {
    pendingCommand.value = command
    assistantInput.value = getAssistantCommandValue(command, l)
    return
  }
  runAssistantCommand?.(command)
}

const cancelCommand = () => {
  pendingCommand.value = null
  assistantInput.value = ''
}

const submitCommand = () => {
  if (!pendingCommand.value) {
    return
  }
  runAssistantCommand?.(pendingCommand.value, assistantInput.value)
  cancelCommand()
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
  .umo-dropdown__item {
    max-width: 260px !important;
  }
}

.umo-ai-assistant-menu {
  width: 260px;
  padding: 4px;
  box-sizing: border-box;
}

.umo-ai-assistant-menu-item {
  display: block;
  width: 100%;
  min-height: 32px;
  padding: 5px 12px;
  border: 0;
  border-radius: var(--umo-radius);
  background: transparent;
  color: var(--umo-text-color);
  font: inherit;
  font-size: 13px;
  line-height: 22px;
  text-align: left;
  cursor: pointer;

  &:hover:not(:disabled) {
    background: var(--umo-button-hover-background);
  }

  &:disabled {
    color: var(--umo-text-color-disabled);
    cursor: not-allowed;
  }
}

.umo-ai-assistant-input {
  width: 260px;
  padding: 8px;
  box-sizing: border-box;
  border-top: solid 1px var(--umo-border-color-light);

  &-actions {
    display: flex;
    justify-content: flex-end;
    gap: 6px;
    margin-top: 8px;
  }
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
