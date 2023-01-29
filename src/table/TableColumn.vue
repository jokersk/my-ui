<template></template>
<script setup lang="ts">
import { computed, inject, h, useSlots, onBeforeMount, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Options } from './Type'
import get from 'lodash/get'
const router = useRouter()
const addColumn = inject<Function>('addColumn')
const getOptions = inject<() => Options>('getOptions')

const props = defineProps<{
    prop?: string
    label: string | Function
    maxWidth?: string
    clickToDetail?: string
    /**
     * make the table th sortable
     * example: <tableColumn sorting-key="name" prop="name" />
     * now when user click the coresponse table th, the down arrow will appear
     * */
    sortingKey?: string
}>()
const { prop, label, clickToDetail, maxWidth = 'none' } = props

const slot = useSlots()

const normalizeLabel = () => {
    if (typeof label === 'function') return label()
    return label
}

const className =
    'whitespace-nowrap px-3 py-4 text-sm cursor-pointer group-first:pl-6 truncate flex-grow'

onMounted(() => {
    const detailKey = getOptions()?.detailKey || 'id'
    let onClick = getOptions()?.detailUrl
        ? id => router.push({ name: getOptions().detailUrl, params: { id } })
        : () => {}
    const attrs = row => ({
        class: className,
        onClick: () => onClick(get(row, detailKey)),
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
