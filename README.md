# Vemto Multi-Tenancy Plugin

> This is a [Vemto](https://vemto.app) plugin. Vemto is a GUI [Laravel](https://laravel.com) generator with a complete set of tools for starting new [Laravel](https://laravel.com) projects. 

This plugin is intended to bring a multi-tenancy base to your Vemto Laravel projects with a multiple database approach, using the [Laravel Multi-Tenancy](https://spatie.be/docs/laravel-multitenancy/v1/introduction) package from [Spatie](https://spatie.be/).

If you want to understand better how the [Laravel Multi-Tenancy](https://spatie.be/docs/laravel-multitenancy/v1/introduction) package works, it is highly recommended to [watch this video](https://spatie.be/videos/laravel-package-training/laravel-multitenancy).

> **WARNING:** despite installing and configuring a multi-tenancy base, this package does not contain logic for the automated creation of Tenants and Databases yet, since each type of application has a different logic.

![image](https://user-images.githubusercontent.com/11933789/145284483-129dfad5-00a3-46cd-a3f1-8b68226d3420.png)

## What this plugin does

- Installs the [Laravel Multi-Tenancy package](https://spatie.be/docs/laravel-multitenancy/v1/introduction)
- Configures the package
- Configures it to use the ["Domain Strategy"](https://spatie.be/docs/laravel-multitenancy/v1/installation/determining-current-tenant) to find the tenant
- Changes the application files to support multi-tenancy (seeders, models, etc)
- Migrates landlord and tenants tables (*it does not create the databases, please see more details below*)
- Opens tenant URLs when you run the project

## Why this package does not generate tenant databases?

There are numerous strategies for creating the database for each Tenant, and this varies a lot for each application. Therefore, this plugin only provides a basic interface to configure the Tenant records (the databases of each Tenant, in principle, must be created manually).

After the initial setup, you are free to write the best database creation strategy for your application.

> In the future, we plan to add some more common strategies to the plugin (**we also accept contributions with different strategies and scenarios**).

## Domain Settings

By default, this plugin will configure the application to use the [DomainFinder class](https://spatie.be/docs/laravel-multitenancy/v1/installation/determining-current-tenant), native to the Laravel Multi-Tenancy package, to locate the Tenants.

When installing this plugin, the following domains are configured (you can change them or add other domains in the plugin configuration interface):

- tenant1.test (points to tenant1 database)
- tenant2.test (points to tenant2 database)

This plugin does not add the domains to your operating system's hosts file, nor does it start a server using them. You will need to use some other tool to do this (on macOS you can use [Laravel Valet](https://laravel.com/docs/8.x/valet), on Windows there are other options like [Laragon](https://laragon.org/docs/pretty-urls.html), or you can simply create an [nginx](https://www.nginx.com/) configuration file)

[Learn here how to create Vemto Plugins](https://vemto.app/docs/1.x/creating_plugins)