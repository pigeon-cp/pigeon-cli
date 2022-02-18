# {{ artifact_id }}

{{ description }}

## Debug

```bash
$ mvn compile               # provide necessary .class files
$ vim debug.properties      # config 'pigeon.plugins.paths=/path/to/plugin' & other properties
$ pigeon-cli debug
```

and then run your debugger to connecting jwdp port(default: 56789).
