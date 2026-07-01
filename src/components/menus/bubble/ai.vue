<template>
  <template v-if="visibleCommands.length > 0">
    <div class="umo-bubble-menu-divider"></div>
    <menus-button
      menu-type="dropdown"
      overlay-class-name="umo-ai-assistant-dropdown"
      :tooltip="t('ai.text')"
      :disabled="loading"
      :hide-after-item-click="false"
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
            v-for="command in visibleCommands"
            :key="getAssistantCommandLabel(command, l)"
            class="umo-ai-assistant-menu-item"
            :disabled="loading"
            @click="handleCommand(command)"
          >
            {{ getAssistantCommandLabel(command, l) }}
          </t-dropdown-item>
          <t-dropdown-item
            v-if="pendingCommand"
            class="umo-ai-assistant-input-item"
            value="assistant-input"
          >
            <div class="umo-ai-assistant-input" @click.stop>
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

  .umo-ai-assistant-input-item {
    cursor: default;

    &:hover {
      background: transparent;
    }

    .umo-dropdown__item-text {
      width: 100%;
      padding: 0;
    }
  }
}

.umo-ai-assistant-menu-item {
  .umo-dropdown__item-text {
    width: 260px;
    box-sizing: border-box;
    font-size: 13px;
    line-height: 22px;
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
