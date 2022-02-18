# Pigeon CLI

[Incubating]

A CLI tool for project [Pigeon](https://github.com/pigeon-cp/pigeon).

## Getting Start

### Download

if you have node.js installed upon you machine, you can install `pigeon-cli` via npm by use the command below

```bash
$ npm install -g pigeon-cli
```

otherwise download the executable binary file from [releases](https://github.com/pigeon-cp/pigeon-cli/releases).

### Create Plugin

```bash
$ pigeon-cli plugin [type]      # create new empty plugin project
```

#### Plugin Debug

```bash
$ cd /path/to/plugin        # cd plugin project dir
$ vim debug.properties      # config Pigeon application
$ pigeon-cli debug          # start Pigeon application on debug mode
```

### Manage Pigeon Instance

```bash
$ pigeon-cli
> pigeon.template.list()
```

## References

```bash
$ pigeon-cli --help
$ pigeon-cli [sub-command] --help
```

run command above for more informations.

