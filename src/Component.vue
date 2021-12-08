<template>
    <div class="w-full">
        <div>
            <table class="table-auto w-full">
                <thead>
                    <tr>
                        <th class="px-4 py-2 border-none text-left">Name</th>
                        <th class="px-4 py-2 text-left">Domain</th>
                        <th class="px-4 py-2 text-left">Database</th>
                        <th class="px-4 py-2 text-left"></th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(tenant, index) in pluginData.tenants" :key="index">
                        <td class="px-4 py-4">
                            <input class="input" type="text" v-model="pluginData.tenants[index].name" @input="saveDebounced" placeholder="Name">
                        </td>
                        <td class="px-4 py-4">
                            <input class="input" type="text" v-model="pluginData.tenants[index].domain" @input="saveDebounced" placeholder="Domain">
                        </td>
                        <td class="px-4 py-4">
                            <input class="input" type="text" v-model="pluginData.tenants[index].database" @input="saveDebounced" placeholder="Database">
                        </td>
                        <td>
                            <button class="button-danger" @click="removeTenant(index)">Remove</button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <div class="px-4 py-4">
            <button class="button-primary" @click="addEmptyTenant()">Add Tenant</button>
        </div>
    </div>
</template>

<script>
export default {
    data() {
        return {
            pluginData: {},
        }
    },

    created() {
        this.pluginData = window.vemtoApi.getPluginData()
    },

    methods: {
        addEmptyTenant() {
            this.pluginData.tenants.push({
                name: '',
                domain: '',
                database: ''
            })

            this.save()
        },

        removeTenant(index) {
            this.pluginData.tenants.splice(index, 1)
            this.save()
        },

        saveDebounced: window.vemtoApi.debounce(function() {
            this.save()
        }, 500),

        save() {
            window.vemtoApi.savePluginData(this.pluginData)
        }
    }
}
</script>