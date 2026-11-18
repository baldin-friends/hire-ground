<script setup lang="ts">
// A custom dropdown. The listbox is not a child of the form: <Teleport> renders
// it at the end of <body>, the way component libraries do.
import { onBeforeUnmount, ref, useTemplateRef, watch } from 'vue';

const props = defineProps<{ id: string; label: string; placeholder: string; options: string[] }>();
const value = defineModel<string>({ required: true });

const open = ref(false);
const active = ref(0);
const position = ref({ top: '0px', left: '0px', minWidth: '0px' });
const button = useTemplateRef('button');
const listbox = useTemplateRef('listbox');

// A click anywhere else closes the listbox.
function onPointerDown(event: PointerEvent) {
    const target = event.target as Node;
    if (!button.value?.contains(target) && !listbox.value?.contains(target)) {
        open.value = false;
    }
}

watch(open, (isOpen) => {
    if (isOpen) {
        document.addEventListener('pointerdown', onPointerDown);
    } else {
        document.removeEventListener('pointerdown', onPointerDown);
    }
});
onBeforeUnmount(() => document.removeEventListener('pointerdown', onPointerDown));

function show() {
    const rect = button.value!.getBoundingClientRect();
    position.value = {
        top: `${rect.bottom + window.scrollY + 4}px`,
        left: `${rect.left + window.scrollX}px`,
        minWidth: `${rect.width}px`,
    };
    active.value = Math.max(props.options.indexOf(value.value), 0);
    open.value = true;
    // Safari does not focus a button on click, and the keys are handled on the button.
    button.value!.focus();
}

function choose(option: string) {
    value.value = option;
    open.value = false;
    button.value?.focus();
}

function onKeyDown(event: KeyboardEvent) {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        event.preventDefault();
        if (!open.value) {
            show();
        } else {
            const step = event.key === 'ArrowDown' ? 1 : -1;
            active.value = Math.min(Math.max(active.value + step, 0), props.options.length - 1);
        }
    } else if (event.key === 'Enter' && open.value) {
        event.preventDefault();
        choose(props.options[active.value]);
    } else if (event.key === 'Escape') {
        open.value = false;
    }
}
</script>

<template>
    <label :id="`${id}-label`" :for="id">{{ label }}</label>
    <button
        :id="id"
        ref="button"
        type="button"
        class="select"
        role="combobox"
        aria-haspopup="listbox"
        :aria-expanded="open"
        :aria-controls="`${id}-listbox`"
        :aria-labelledby="`${id}-label`"
        :aria-activedescendant="open ? `${id}-option-${active}` : undefined"
        @click="open ? (open = false) : show()"
        @keydown="onKeyDown"
    >
        {{ value || placeholder }}
    </button>
    <Teleport to="body">
        <ul
            v-if="open"
            :id="`${id}-listbox`"
            ref="listbox"
            class="listbox"
            role="listbox"
            :aria-labelledby="`${id}-label`"
            :style="{ position: 'absolute', ...position }"
        >
            <li
                v-for="(option, index) in options"
                :id="`${id}-option-${index}`"
                :key="option"
                :class="{ active: index === active }"
                role="option"
                :aria-selected="option === value"
                @click="choose(option)"
            >
                {{ option }}
            </li>
        </ul>
    </Teleport>
</template>
