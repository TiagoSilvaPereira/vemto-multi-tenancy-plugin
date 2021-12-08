<template>
    <div class="w-full">
        <div>
            <h3 class="block font-bold mb-2">Plugin Version <small>(Spatie Laravel Multi-Tenancy)</small></h3>
            <div class="relative">
                <select class="input" v-model="pluginData.version" @change="save()">
                    <option value="^1.0">1.0</option>
                    <option value="^2.0">2.0 (requires PHP 8+)</option>
                </select>
            </div>
        </div>

        <div class="mt-5">
            <h3 class="block font-bold mb-2">Tenants</h3>

            <table class="table-auto w-full">
                <thead>
                    <tr>
                        <th class="px-3 py-1 border-none text-left">Name</th>
                        <th class="px-3 py-1 text-left">Domain</th>
                        <th class="px-3 py-1 text-left">Database</th>
                        <th class="px-3 py-1 text-left"></th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(tenant, index) in pluginData.tenants" :key="index">
                        <td class="px-3 py-2">
                            <input class="input" type="text" v-model="pluginData.tenants[index].name" @input="saveDebounced" placeholder="Name">
                        </td>
                        <td class="px-3 py-2">
                            <input class="input" type="text" v-model="pluginData.tenants[index].domain" @input="saveDebounced" placeholder="Domain">
                        </td>
                        <td class="px-3 py-2">
                            <input class="input" type="text" v-model="pluginData.tenants[index].database" @input="saveDebounced" placeholder="Database">
                        </td>
                        <td>
                            <button class="button-danger" @click="removeTenant(index)">Remove</button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <div class="px-3 py-2">
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