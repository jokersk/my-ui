<template>
    <div class="mt-8 flex flex-col">
        <div class="flex justify-between items-center mb-4">
            <slot name="creating" />
            <div class="flex justify-end space-x-4">
                <slot name="topright"></slot>
            </div>
        </div>
        <div class="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div class="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
                <div class="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                    <div class="hidden">
                        <slot></slot>
                    </div>
                    <div
                        :class="
                            withSearching || slot.filter
                                ? 'flex justify-between bg-white border-b items-center px-6 py-3'
                                : ''
                        "
                    >
                        <slot name="searching" />
                        <slot name="filter" />
                    </div>
                    <table class="min-w-full divide-y divide-gray-300">
                        <thead class="bg-gray-50">
                            <tr>
                                <th
                                    v-for="(column, index) in columns"
                                    :key="index"
                                    :class="thStyle"
                                >{{ normalizelabel(column.label) }}</th>
                            </tr>
                        </thead>
                        <ListTableBody :data="data" :columns="columns"></ListTableBody>
                        <template v-if="data.length <= 0">
                            <tbody class="bg-white">
                                <tr>
                                    <td
                                        colspan="100%"
                                        class="whitespace-nowrap px-3 py-4 text-sm cursor-pointer group-first:pl-6 truncate flex-grow text-center"
                                    >
                                        ...
                                    </td>
                                </tr>
                            </tbody>
                        </template>
                    </table>
                    <slot name="pagination" />
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import {
    provide,
    ref,
    useSlots,
    watch,
watchEffect,
} from 'vue'
import ListTableBody from './list-table-body'

const slot = useSlots()

type WithCreating = {
    name: string
    display: string | Function
}


const props = defineProps<{
    do?: Permissions
    initData?: []
    dataUrl?: string
    withSearching?: boolean
    withCreating?: WithCreating
    topRight?: Function | []
    defaultFetchParams?: {}
    tdStyle?: string
    thStyle?: string
}>()

provide<string>('tdStyle', props.tdStyle)

const {
    withSearching = false,
} = props

const data = ref([])

watchEffect(() => {
    if (! data.value.length ) {
        data.value = props.initData
    }
})

const columns = ref([])
const index = ref(0)

const addIndex = () => {
    return index.value++
}

const addColumn = (column) => {
    columns.value.push(column)
}

provide('addIndex', addIndex)
provide('addColumn', addColumn)

const normalizelabel = (label: Function | string) => {
    if (typeof label === 'function') {
        return label()
    }
    return label
}

</script>
