<template>
    <button type="button" class="w-[150px]">
        <svg
            v-if="state === StateType.loading"
            class="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
        >
            <circle
                class="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="4"
            ></circle>
            <path
                class="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
        </svg>
        <slot name="successIcon"></slot>
        <slot></slot>
    </button>
</template>
<script setup lang="ts">
import { ref } from 'vue'

export enum StateType {
    loading = 'loading',
    normal = 'normal',
    success = 'success',
    error = 'error',
}

const state = ref(StateType.normal)

const success = () => {
    state.value = StateType.success
    setTimeout(() => (state.value = StateType.normal), 500)
}

const normal = () => (state.value = StateType.normal)
const loading = () => (state.value = StateType.loading)

defineExpose({ success, normal, loading })
</script>
