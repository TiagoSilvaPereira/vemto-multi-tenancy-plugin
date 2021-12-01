<template>
    <div class="w-full">
        A simple Vemto Plugin base:
        
        <br/>

        <input class="input" type="input" v-model="text">
        
        <br/>
        
        <button class="button-primary" @click="save">Save</button>
    </div>
</template>

<script>
export default {
    data() {
        return {
            text: '',
            pluginData: {},
        }
    },

    created() {
        this.pluginData = window.vemtoApi.getPluginData()
        this.text = this.pluginData.text

        window.vemtoApi.pluginConsole.log('Vue component created')
    },

    methods: {
        save() {
            window.vemtoApi.pluginConsole.log('Some message here')
            window.vemtoApi.pluginConsole.error('Something went wrong')

            window.vemtoApi.pluginConsole.log('Lorem ipsum...')

            try {
                throw new Error('It is an error from a try/catch block')
            } catch (error) {
                window.vemtoApi.pluginConsole.error(error)
                window.vemtoApi.pluginConsole.error('string message')
            }

            window.vemtoApi.pluginConsole.error('Message error')

            window.vemtoApi.savePluginData({
                text: this.text
            })
        }
    }
}
</script>