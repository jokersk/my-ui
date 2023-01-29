<template></template>
<script setup lang="ts">
import { inject, h, useSlots, onMounted } from 'vue'
import get from 'lodash/get'
const addColumn = inject('addColumn')
const style = inject<string>('tdStyle')

const props = defineProps<{
    prop?: string
    label: string | Function
    maxWidth?: string
    clickToDetail?: string
    /**
     * make the table th sortable
     * example: 
     * now when user click the coresponse table th, the down arrow will appear
     * */
    sortingKey?: string
}>()
const { prop, label, clickToDetail, maxWidth = 'none' } = props

const slot = useSlots()

onMounted(() => {
    const attrs = row => ({
        class: style,
        style: { 'max-width': maxWidth }
    })
    addColumn({
        label,
        prop,
        sortingKey: props.sortingKey,
        renderCell(row: {}) {
            if (slot.default) {
                return h('div', attrs(row), slot.default({ row }))
            }
            return h('div', attrs(row), get(row, prop))
        }
    })
})
</script>
