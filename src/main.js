module.exports = (vemto) => {

    return {

        canInstall() {
            return true
        },

        onInstall() {
            vemto.savePluginData({
                text: 'Hello world!!'
            })
        },

        composerPackages(packages) {
            packages.require['spatie/laravel-multitenancy'] = '^1.0'

            return packages
        },

        beforeCodeGenerationEnd() {
            // let data = vemto.getPluginData()

            vemto.log.info(`Configuring Multi-Tenancy`)

            this.publishConfigFile()

            this.addDatabaseConnections()
        },

        publishConfigFile() {
            if(vemto.projectFileExists('/config/multitenancy.php')) {
                vemto.log.warning('Multi-Tenancy configuration already generated. Skipping...')
                return
            }

            let command = `vendor:publish --provider="Spatie\\Multitenancy\\MultitenancyServiceProvider" --tag="config"`

            vemto.executeArtisan(command)

            // Register the file to prevent Vemto overwriting it after manual changes
            vemto.registerProjectFile('/config/multitenancy.php')
        },
 
        addDatabaseConnections() {
            let projectConnectionType = vemto.getProject().connection.type, // mysql, pgsql, etc

                databaseFileContent = vemto.readProjectFile('config/database.php'),
                multitenancySettings = vemto.readPluginFile(`files/${projectConnectionType}-settings.txt`)    
            
            if(databaseFileContent.includes(`'tenant' => [`)) {
                vemto.log.warning('Multi-Tenancy Database configuration already generated. Skipping...')
                return
            }

            let phpParser = vemto.parsePhp(databaseFileContent)
            
            phpParser.addItemToNestedNamedArray('connections', multitenancySettings)

            let newDatabaseConfigContent = vemto.formatByLanguage(phpParser.getCode(), 'php')

            vemto.writeProjectFile('config/database.php', newDatabaseConfigContent)

            // Register the file to prevent Vemto overwriting it after manual changes
            vemto.registerProjectFile('config/database.php')
        }

    }

}