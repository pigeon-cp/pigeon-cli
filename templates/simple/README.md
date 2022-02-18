# {{ artifact_id }}

{{ description }}

## Debug

```bash
$ mvn compile               # provide necessary .class files
$ vim debug.properties      # config debug properties if nececssary
$ pigeon-cli debug
```

and then run your debugger to connecting jwdp port(default: 56789).
