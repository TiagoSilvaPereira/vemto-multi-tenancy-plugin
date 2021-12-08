module.exports = (vemto) => {

    return {

        canInstall() {
            if(vemto.projectHasMultiTenancy()) {
                vemto.addBlockReason('You already have a multitenancy plugin installed')
                return false
            }

            return true
        },

        onInstall() {
            vemto.savePluginData({
                version: '^1.0',
                tenants: [
                    {name: 'Tenant1', domain: 'tenant1.test', 'database': 'tenant1'},
                    {name: 'Tenant2', domain: 'tenant2.test', 'database': 'tenant2'},
                ]
            })

            vemto.setMultiTenancyStrategy('multi-database')
        },

        composerPackages(packages) {
            packages.require['spatie/laravel-multitenancy'] = '^1.0'

            return packages
        },

        templateReplacements() {
            vemto.log.message('Replacing stubs from Multi-Tenancy plugin...')

            vemto.replaceTemplate('DatabaseSeeder.vemtl', '/files/templates/DatabaseSeeder.vemtl')
        },

        beforeRunnerStart() {
            vemto.disableDefaultRunnerServer()
            vemto.disableDefaultRunnerMigrations()
            vemto.disableDefaultRunnerWebPageTrigger()
        },

        beforeRunnerEnd() {
            let data = vemto.getPluginData()

            this.migrateAndSeedLandlordDatabase()
            this.migrateTenantDatabases()

            data.tenants.forEach(tenant => {
                vemto.openLink(`http://${tenant.domain}`)
            })
        },

        beforeCodeGenerationEnd() {
            vemto.log.info(`Configuring Multi-Tenancy`)
            
            this.addMiddlewares()
            this.publishConfigFile()
            this.editConfigFile()
            this.addDatabaseConnections()
            this.publishLandlordMigration()
        },

        beforeRenderModel(template, content) {
            let data = template.getData(),
                model = data.model

            return this.addTenancyTraitToModel(content, model)
        },

        addTenancyTraitToModel(content, model) {
            let phpFile = vemto.parsePhp(content)

            phpFile.addUseStatement('Spatie\\Multitenancy\\Models\\Concerns\\UsesTenantConnection')
            phpFile.onClass(model.name).addTrait('UsesTenantConnection')

            vemto.log.message(`Adding UsesTenantConnection trait to ${model.name} model...`)

            return phpFile.getCode()
        },

        addMiddlewares() {
            kernelFileContent = vemto.readProjectFile('/app/Http/Kernel.php')  
            
            if(kernelFileContent.includes(`NeedsTenant`)) return

            let phpParser = vemto.parsePhp(kernelFileContent),
                arrays = phpParser.getNestedArraysByName('web')

            phpParser.onArray(arrays[0])
                .addItem('\\Spatie\\Multitenancy\\Http\\Middleware\\NeedsTenant::class')
                .addItem('\\Spatie\\Multitenancy\\Http\\Middleware\\EnsureValidTenantSession::class')

            let newKernelFileContent = phpParser.getFormattedCode()

            vemto.writeProjectFile('/app/Http/Kernel.php', newKernelFileContent)

            // Register the file to prevent Vemto overwriting it after manual changes
            vemto.registerProjectFile('/app/Http/Kernel.php')
        },

        publishConfigFile() {
            if(vemto.projectFileExists('/config/multitenancy.php')) {
                vemto.log.warning('Multi-Tenancy configuration already generated. Skipping...')
                return
            }

            let data = vemto.getPluginData(),
                tag = data.version === '^1.0' ? 'config' : 'multitenancy-config',
                command = `vendor:publish --provider="Spatie\\Multitenancy\\MultitenancyServiceProvider" --tag="${tag}"`

            vemto.executeArtisan(command)
            vemto.registerProjectFile('/config/multitenancy.php')
        },

        editConfigFile() {
            if(!vemto.projectFileExists('/config/multitenancy.php')) return

            let configFileContent = vemto.readProjectFile('/config/multitenancy.php')

            if(configFileContent.includes(`DomainTenantFinder`)) {
                vemto.log.warning('Multi-Tenancy configuration already modified. Skipping...')
                return
            }

            configFileContent = configFileContent.replace(`'tenant_finder' => null`, `'tenant_finder' => Spatie\\Multitenancy\\TenantFinder\\DomainTenantFinder::class`)
            configFileContent = configFileContent.replace(`'tenant_database_connection_name' => null`, `'tenant_database_connection_name' => 'tenant'`)
            configFileContent = configFileContent.replace(`'landlord_database_connection_name' => null`, `'landlord_database_connection_name' => 'landlord'`)

            let phpParser = vemto.parsePhp(configFileContent)
            phpParser.prependItemToNestedNamedArray('switch_tenant_tasks', 'Spatie\\Multitenancy\\Tasks\\SwitchTenantDatabaseTask::class')

            let newConfigFileContent = phpParser.getFormattedCode()

            vemto.writeProjectFile('/config/multitenancy.php', newConfigFileContent)
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

            databaseFileContent = databaseFileContent.replace(`env('DB_CONNECTION', 'mysql')`, `'tenant'`)

            let phpParser = vemto.parsePhp(databaseFileContent)
            
            phpParser.prependItemToNestedNamedArray('connections', multitenancySettings)

            let newDatabaseConfigContent = phpParser.getFormattedCode()

            vemto.writeProjectFile('/config/database.php', newDatabaseConfigContent)
            vemto.registerProjectFile('/config/database.php')
        },

        publishLandlordMigration() {
            if(vemto.projectFolderExists('/database/migrations/landlord')) {
                vemto.log.warning('Multi-Tenancy Landlord migration already generated. Skipping...')
                return
            }

            let data = vemto.getPluginData(),
                tag = data.version === '^1.0' ? 'migrations' : 'multitenancy-migrations',
                command = `vendor:publish --provider="Spatie\\Multitenancy\\MultitenancyServiceProvider" --tag="${tag}"`

            vemto.executeArtisan(command)
        },

        migrateAndSeedLandlordDatabase() {
            let migrationCommand = `migrate:fresh --path=database/migrations/landlord --database=landlord`,
                seederCommand = 'db:seed'

            vemto.executeArtisan(migrationCommand)
            vemto.executeArtisan(seederCommand)
        },

        migrateTenantDatabases() {
            let migrationCommand = `tenants:artisan "migrate:fresh --database=tenant --seed"`

            vemto.executeArtisan(migrationCommand)
        }

    }

}