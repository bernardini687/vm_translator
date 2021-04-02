```sh
npm install             # setup project
npm run test            # check tests

bin/cli.js test/Test.vm # try it out

npm run lint            # check linter errors
npm run fix             # run linter with fix option
```

```sh
# additional options:

PRINT_SOURCE_COMMAND=1 bin/cli.js test/Test.vm # prepend output code with its source command
```
