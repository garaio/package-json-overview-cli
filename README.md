# GARAIO - Package.json Overview Tool (G-POT)

## WIP (work in progress)

This script is WIP and has subject to change.

## Introduction

This tool aims to help you with finding `package.json`-files look for specific installed packages and run some additional commands.
If you have dozens of installed packages you might easily loose the overview of which version is installed where.
G-POT will assist you in finding a installed package accross your projects, and also shows you what the latest version would be matching the version-filter and the package in general.

The script assumes that you have all your projects within a specific folder. Of course you can let it scan a whole drive, but this will probably take some time.

## Example

You are wondering where you have vue 2.x installed and in what version?

```node
node index.js template-packageVersion vue@2
```

It will output something like this:

```node

  ### GARAIO POT (Package.json) Overview Tool ###

Latest version of vue@2 filter seems to be: 2.7.14
Latest version of vue itself, seems to be: 3.2.45

Searching for installed "vue@2" packages in "C:\git\"...
.....!


Amount of package.json files: 5
Amount of installations of this package: 1
┌─────────┬──────────────────┬─────────┬───────────┬──────────┬────────┬──────────────────────┐
│ (index) │     project      │ package │ installed │  latest  │ status │ latestPackageVersion │
├─────────┼──────────────────┼─────────┼───────────┼──────────┼────────┼──────────────────────┤
│    0    │ 'vue-base@0.2.0' │  'vue'  │ '2.6.14'  │ '2.7.14' │  '❗'   │       '3.2.45'       │
└─────────┴──────────────────┴─────────┴───────────┴──────────┴────────┴──────────────────────┘
```

## Script / Execution

Per default it searches for all package.json files. Then it verifies if a given package is installed there, then it will check the version number and output a simple console table containing some information.

### Goal / Additional commands (beta / WIP)

In addition, the script will try to support to execute other commands in addition to the previous check.

This would make it possible to check for example:

* the current git branch of the directory
* updating a package
* executing any other command (npm, git, etc)

The goal would be, that the script could simplify a little bit how to update several projects, or find specific information across all wanted projects.

### Context / Directories to scan

Per default the script will search from the current directory where you executed the script.
It has however an argument to define the directory.

```node
node index.js template-packageVersion vue C:/path/to/some/other/directory
```

### Help

Execute the script in the simplest form, will output some help for how to use the script.

```node
node index.js
```

## NOTE

There is no guarantee that the output is correct, as of npm versions, tags, releases etc.
It's always better to check yourself what version is really the "latest", stable etc.
If you found issues, or want to contribute, please fill an issue on GitHub, or contact me, thanks.
