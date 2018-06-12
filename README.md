@meep/cli
=========

meep CLI

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/@meep/cli.svg)](https://npmjs.org/package/@meep/cli)
[![CircleCI](https://circleci.com/gh/jdxcode/meep-cli/tree/master.svg?style=shield)](https://circleci.com/gh/jdxcode/meep-cli/tree/master)
[![Appveyor CI](https://ci.appveyor.com/api/projects/status/github/jdxcode/meep-cli?branch=master&svg=true)](https://ci.appveyor.com/project/jdxcode/meep-cli/branch/master)
[![Codecov](https://codecov.io/gh/jdxcode/meep-cli/branch/master/graph/badge.svg)](https://codecov.io/gh/jdxcode/meep-cli)
[![Downloads/week](https://img.shields.io/npm/dw/@meep/cli.svg)](https://npmjs.org/package/@meep/cli)
[![License](https://img.shields.io/npm/l/@meep/cli.svg)](https://github.com/jdxcode/meep-cli/blob/master/package.json)

<!-- toc -->
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->
# Usage
<!-- usage -->
```sh-session
$ npm install -g meep-cli
$ meep COMMAND
running command...
$ meep (-v|--version|version)
meep-cli/0.0.0 darwin-x64 node-v8.11.2
$ meep --help [COMMAND]
USAGE
  $ meep COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`meep dev`](#meep-dev)
* [`meep help [COMMAND]`](#meep-help-command)
* [`meep serve`](#meep-serve)

## `meep dev`

```
USAGE
  $ meep dev

OPTIONS
  -h, --help  show CLI help
```

_See code: [src/commands/dev.ts](https://github.com/jdxcode/meep-cli/blob/v0.0.0/src/commands/dev.ts)_

## `meep help [COMMAND]`

display help for meep

```
USAGE
  $ meep help [COMMAND]

ARGUMENTS
  COMMAND  command to show help for

OPTIONS
  --all  see all commands in CLI
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v2.0.5/src/commands/help.ts)_

## `meep serve`

```
USAGE
  $ meep serve

OPTIONS
  -h, --help  show CLI help
  --spa
```

_See code: [src/commands/serve.ts](https://github.com/jdxcode/meep-cli/blob/v0.0.0/src/commands/serve.ts)_
<!-- commandsstop -->
