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
            this.editConfigFile()
            this.addDatabaseConnections()
            this.publishLandlordMigration()
            this.migrateLandlordDatabase()
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

        editConfigFile() {
            if(!vemto.projectFileExists('/config/multitenancy.php')) return

            let configFileContent = vemto.readProjectFile('/config/multitenancy.php')

            if(configFileContent.includes(`Spatie\\Multitenancy\\Tasks\\SwitchTenantDatabaseTask::class`)) {
                vemto.log.warning('Multi-Tenancy configuration already modified. Skipping...')
                return
            }

            configFileContent = configFileContent.replace(`'tenant_database_connection_name' => null`, `'tenant_database_connection_name' => 'tenant'`)
            configFileContent = configFileContent.replace(`'landlord_database_connection_name' => null`, `'landlord_database_connection_name' => 'landlord'`)

            let phpParser = vemto.parsePhp(configFileContent)
            phpParser.addItemToNestedNamedArray('switch_tenant_tasks', 'Spatie\\Multitenancy\\Tasks\\SwitchTenantDatabaseTask::class')

            let newConfigFileContent = vemto.formatByLanguage(phpParser.getCode(), 'php')

            vemto.writeProjectFile('/config/multitenancy.php', newConfigFileContent)

            // Register the file to prevent Vemto overwriting it after manual changes
            vemto.registerProjectFile('/config/multitenancy.php')
        },
 
        addDatabaseConnections() {
            let projectConnectionType = vemto.getProject().connection.type, // mysql, pgsql, etc

                databaseFileContent = vemto.readProjectFile('/config/database.php'),
                multitenancySettings = vemto.readPluginFile(`files/${projectConnectionType}-settings.txt`)    
            
            if(databaseFileContent.includes(`'tenant' => [`)) {
                vemto.log.warning('Multi-Tenancy Database configuration already generated. Skipping...')
                return
            }

            let phpParser = vemto.parsePhp(databaseFileContent)
            
            phpParser.addItemToNestedNamedArray('connections', multitenancySettings)

            let newDatabaseConfigContent = vemto.formatByLanguage(phpParser.getCode(), 'php')

            vemto.writeProjectFile('/config/database.php', newDatabaseConfigContent)

            // Register the file to prevent Vemto overwriting it after manual changes
            vemto.registerProjectFile('/config/database.php')
        },

        publishLandlordMigration() {
            if(vemto.projectFolderExists('/database/migrations/landlord')) {
                vemto.log.warning('Multi-Tenancy Landlord migration already generated. Skipping...')
                return
            }

            let command = `vendor:publish --provider="Spatie\\Multitenancy\\MultitenancyServiceProvider" --tag="migrations"`

            vemto.executeArtisan(command)
        },

        migrateLandlordDatabase() {
            let command = `migrate --path=database/migrations/landlord --database=landlord`

            vemto.executeArtisan(command)
        }

    }

}