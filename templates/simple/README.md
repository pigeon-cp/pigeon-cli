# {{ artifact_id }}

{{ description }}

## Debug

```bash
$ mvn compile               # provide necessary .class files
$ vim debug.properties      # config debug properties if nececssary
$ pigeon-cli debug
```

then run your debugger to connecting jwdp port(default: 56789).

```bash
$ curl -s http://localhost:18080/actuator/pigeon/info
```

then run command above to get plugin info loaded by Pigeon application. and you will see json result like the sample below

```json
{"plugins":{"pigeon-sample":{"extensions":[...],"state":"STARTED","version":"0.1"}}}
```

### Send demo message

```bash
$ pigeon-cli
> apis.messages.send('DEMO', {target: "taccisum", title: "demo", content: "hello pigeon", channel: "DEMO"})
```
