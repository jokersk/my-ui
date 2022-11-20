<template>
    <div class="mt-8 flex flex-col">
        <div class="flex justify-between items-center mb-4">
            <template v-if="withCreating">
                <div class="flex">
                    <RouterLink :class="buttonStyle" :to="withCreating.name">
                        {{ createtingDisplay() }}
                    </RouterLink>
                </div>
            </template>
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
                        <div v-if="withSearching">
                            <div class="flex">
                                <BaseInput
                                    class="w-64 flex-grow-0 mr-4"
                                    :bind="{ 'data-test': 'search-input' }"
                                    :model-value="fetchParams.keyword"
                                    @update:model-value="updateKeyword"
                                />
                                <Button>search</Button>
                            </div>
                        </div>
                        <div v-if="slot.filter" class="">
                            <DropDown>
                                <FilterIcon />
                                <template #dropdown>
                                    <div class="p-6">
                                        <div class="border-b mb-4 flex justify-between">
                                            <span>filter</span>
                                            <Button
                                                @click="clearFilter"
                                            >
                                                clear
                                            </Button>
                                        </div>
                                        <slot
                                            name="filter"
                                            :updateFilter="updateFilter"
                                            :getFilter="getFilter"
                                        />
                                    </div>
                                </template>
                            </DropDown>
                        </div>
                    </div>
                    <table class="min-w-full divide-y divide-gray-300">
                        <thead class="bg-gray-50">
                            <tr>
                                <TableTh
                                    v-for="(column, index) in columns"
                                    :key="index"
                                    :label="normalizelabel(column.label)"
                                    :sorting-key="column.sortingKey"
                                    :sorting-map="sortingMap"
                                    @update:sort="updateSorting"
                                />
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
                    <template v-if="meta.total > meta.per_page">
                        <Pagination
                            :meta="meta"
                            class="!mt-0 rounded-t-none"
                            @paginate="onPaginate"
                        />
                    </template>
                    <template v-else>
                        <slot name="footer">
                            <div class="bg-white h-10 border-t border-gray-200"></div>
                        </slot>
                    </template>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import {
    computed,
    onBeforeMount,
    onMounted,
    provide,
    reactive,
    Ref,
    ref,
    h,
    useSlots,
    isRef,
    watchEffect
} from 'vue'
import ListTableBody from './ListTableBody'
import { Column, Options } from './Type'
import axios from 'axios'
import Pagination from '@/components/shared/Pagination.vue'
import FilterIcon from './FilterIcon.vue'
import DropDown from './DropDown.vue'
import { MenuItem } from '@headlessui/vue'
import { useListTableStore } from '@/functions/useListTableStore'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { curry, debounce } from 'lodash'
import TableTh from './TableTh.vue'
import Button from '../shared/Button.vue'
import BaseInput from '../shared/BaseInput.vue'
import { buttonStyle } from '../shared/ButtonStyle'

const slot = useSlots()

type WithCreating = {
    name: string
    display: string | Function
}

const route = useRoute()
const router = useRouter()

const props = defineProps<{
    do: Permissions
    initData?: []
    dataUrl?: string
    withSearching?: boolean
    withCreating?: WithCreating
    topRight?: Function | []
    /**
     * we can navigate to somewhere when click the table row by input the options
     * eg: { detailUrl: 'order-list', detailKey: 'order_number' }
     * */
    options?: Options
    defaultFetchParams?: {}
}>()

const {
    dataUrl,
    withSearching = false,
    withCreating,
    topRight,
    options,
    defaultFetchParams = {}
} = props

const data = ref([])
const meta = ref({})
const columns = ref([])
const index = ref(0)
const labels = computed(() => columns.value.map(c => c.label))

const addIndex = () => {
    return index.value++
}

const addColumn = (column: Column) => {
    columns.value.push(column)
}

const getOptions = () => options

provide('addIndex', addIndex)
provide('addColumn', addColumn)
provide('getOptions', getOptions)

const queryToFilterObject = query => {
    const filter = {}
    for (const key in query) {
        const keyMatch = key.match(/filter\[(.*)\]/)
        if (keyMatch) {
            const value = query[key] === '0' ? 0 : query[key]
            filter[keyMatch[1]] = value
        }
    }
    return filter
}

const transformFetchParams = (fetchParams: {}) => {
    const params: { [key: string]: unknown } = {}
    Object.keys(fetchParams).forEach((paramKey: string) => {
        if (paramKey != 'filter') {
            params[paramKey] = (fetchParams as { [key: string]: unknown })[paramKey]
        }
    })
    for (const filterKey in fetchParams.filter) {
        params[`filter[${filterKey}]`] = fetchParams.filter[filterKey]
    }
    return params
}

const fetchParams = reactive({
    pagination: true,
    page: route.query.page || 1,
    keyword: route.query.keyword,
    filter: queryToFilterObject(route.query),
    sort: route.query.sort,
    ...props.defaultFetchParams
})

const setFilter = (filter: {}) => {
    updateFetchParams('filter', filter)
    setTableFilter(fetchParams.filter)
}

const updateFilter = (key: string, value: string) => {
    const filter = {
        ...fetchParams.filter,
        [key]: value
    }
    console.log(filter )
    setFilter(filter)
}

const clearFilter = () => {
    setFilter({})
}

const getFilter = (key: string) => fetchParams.filter[key]
const { filter: TableFilter, setFilter: setTableFilter } = useListTableStore()
setTableFilter(fetchParams.filter)

provide('updateFilter', updateFilter)
provide('getFilter', getFilter)

defineExpose({
    updateFilter 
})

const fetch = debounce(async params => {
    axios.defaults.headers.common = {
        ...axios.defaults.headers.common,
    }
    const res = await axios.get(dataUrl, { params })
    data.value = res.data.data
    meta.value = res.data.meta
}, 500)

onBeforeMount(async () => {
    if (!props.initData && dataUrl) {
        try {
            fetch(transformFetchParams(fetchParams))
        } catch (e) {}
    }
})

watchEffect(() => {
    if (props.initData) {
        data.value = props.initData
    }
})

const onPaginate = e => {
    updateFetchParams('page', e)
}

const updateKeyword = (e: string) => {
    updateFetchParams('page', 1)
    updateFetchParams('keyword', e)
}

const updateFetchParams = (key: string, value: unknown) => {
    fetchParams[key] = value
    const params = transformFetchParams(fetchParams)
    router.push({ query: params })
    fetch(params)
}


const TopRightWidgets = () => {
    if (!topRight) return
    const payload = {
        params: fetchParams,
        fetch,
        transformedParams: transformFetchParams(fetchParams)
    }
    if (typeof topRight === 'function') {
        return topRight(payload)
    }
    if (Array.isArray(topRight)) {
        return topRight.map(top => top(payload))
    }
}

const normalizelabel = (label: Function | string) => {
    if (typeof label === 'function') {
        return label()
    }
    return label
}

const sortingMap = computed(() => {
    const sorts = (route.query.sort as string)?.split(',')
    const sortMap = new Map()
    if (sorts) {
        while (sorts.length) {
            const current = sorts.shift()
            sortMap.set(current.replace('-', ''), current)
        }
    }
    return sortMap
})

const updateSorting = ({ key, value }: { [key: string]: string }) => {
    sortingMap.value.set(key, value)
    updateFetchParams('sort', Array.from(sortingMap.value.values()).filter(Boolean).join(','))
}

const createtingDisplay = () => {
    return typeof withCreating.display === 'function'
        ? withCreating.display()
        : withCreating.display
}
</script>

