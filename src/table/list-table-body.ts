import { h } from 'vue'
import { Column } from './Type'
export default {
    name: 'ListTableBody',
    props: {
        data: Array,
        columns: Array
    },
    render() {
        if (this.data) {
            return h(
                'tbody',
                { class: 'bg-white' },
                this.data.map((row, index)=>
                    h(
                        'tr',
                        { key: index, class: 'even:bg-gray-50'},
                        this.columns.map((c: Column) =>
                            h(
                                'td',
                                {
                                    key: c.prop,
                                    class: 'group'
                                },
                                c.renderCell(row)
                            )
                        )
                    )
                )
            )
        }
        return h('div')
    }
}
