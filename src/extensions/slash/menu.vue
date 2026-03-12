<template>
  <div ref="popupRef" class="umo-popup umo-slash-command-popup">
    <div class="umo-popup__content umo-dropdown">
      <div class="umo-dropdown__menu umo-slash-command-menu">
        <template v-if="items.length > 0">
          <div>
            <template v-for="(item, index) in items" :key="item.key">
              <div v-if="showGroupLabel(index)" class="umo-slash-command-group">
                {{ item.group }}
              </div>
              <li
                class="umo-dropdown__item umo-dropdown__item--theme-default umo-slash-command-item"
                :class="{ 'umo-dropdown__item--active': index === selectedIndex }"
                @click="selectItem(index)"
              >
                <span class="umo-slash-command-item-icon">
                  <span
                    v-if="isSvgIcon(item.icon)"
                    class="umo-slash-command-item-icon-svg"
                    v-html="item.icon"
                  ></span>
                  <icon v-else :name="item.icon || 'menu'" />
                </span>
                <span class="umo-slash-command-item-content">
                  <span class="umo-slash-command-item-title">{{ item.label }}</span>
                  <span
                    v-if="item.description"
                    class="umo-slash-command-item-description"
                  >
                    {{ item.description }}
                  </span>
                </span>
              </li>
            </template>
          </div>
        </template>
        <div v-else class="umo-slash-command-empty">
          {{ t('slashCommands.noResult') }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { isString } from '@tool-belt/type-predicates'

const props = defineProps({
  items: {
    type: Array,
    required: true,
  },
  command: {
    type: Function,
    required: true,
  },
})

let selectedIndex = $ref(0)
const popupRef = ref(null)

watch(
  () => props.items,
  () => {
    selectedIndex = 0
  },
)

watch(
  () => selectedIndex,
  async () => {
    await nextTick()
    const activeItem = popupRef.value?.querySelector(
      '.umo-slash-command-item.umo-dropdown__item--active',
    )
    activeItem?.scrollIntoView({ block: 'nearest' })
  },
)

const isSvgIcon = (icon) => {
  return isString(icon) && icon.trim().startsWith('<')
}

const showGroupLabel = (index) => {
  if (index === 0) {
    return !!props.items[index]?.group
  }
  return props.items[index - 1]?.group !== props.items[index]?.group
}

const onKeyDown = ({ event }) => {
  if (event.key === 'ArrowUp') {
    upHandler()
    return true
  }

  if (event.key === 'ArrowDown') {
    downHandler()
    return true
  }

  if (event.key === 'Enter' || event.key === 'Tab') {
    if (props.items.length === 0) {
      return false
    }
    event.preventDefault()
    enterHandler()
    return true
  }

  return false
}

const upHandler = () => {
  if (props.items.length === 0) {
    return
  }
  selectedIndex = (selectedIndex + props.items.length - 1) % props.items.length
}

const downHandler = () => {
  if (props.items.length === 0) {
    return
  }
  selectedIndex = (selectedIndex + 1) % props.items.length
}

const enterHandler = () => {
  selectItem(selectedIndex)
}

const selectItem = (index) => {
  const item = props.items[index]
  if (item) {
    props.command(item)
  }
}

defineExpose({
  onKeyDown,
})
</script>

<style lang="less">
.umo-slash-command-popup {
  width: 280px;

  .umo-dropdown__menu {
    padding: 5px;
    max-height: 360px;
    overflow-y: auto;
  }
}

.umo-slash-command-group {
  padding: 8px 10px 4px;
  font-size: 12px;
  color: var(--umo-text-color-light);
}

.umo-slash-command-item {
  align-items: flex-start;
  gap: 10px;
  border-radius: var(--umo-radius);

  &-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 18px;
    height: 18px;
    margin-top: 2px;
    color: var(--umo-text-color-light);

    &-svg {
      display: inline-flex;

      svg {
        width: 16px;
        height: 16px;
      }
    }
  }

  &-content {
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
  }

  &-title {
    color: var(--umo-text-color);
    font-size: 13px;
  }

  &-description {
    color: var(--umo-text-color-light);
    font-size: 12px;
    line-height: 1.4;
    white-space: normal;
  }
}

.umo-slash-command-empty {
  padding: 8px 10px;
  font-size: 12px;
  color: var(--umo-text-color-light);
}
</style>
