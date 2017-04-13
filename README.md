# HXD
[![npm](https://img.shields.io/npm/v/hxd.svg?style=flat-square)](https://npmjs.com/package/hxd)
[![npm license](https://img.shields.io/npm/l/hxd.svg?style=flat-square)](https://npmjs.com/package/hxd)
[![npm downloads](https://img.shields.io/npm/dm/hxd.svg?style=flat-square)](https://npmjs.com/package/hxd)

### Install via [npm](https://npmjs.com)

```sh
$ npm install --global hxd
```

## CLI Usage

```sh
# Hexdump a given file to stdout
$ hxd filename.bin
# Or pipe to it via stdin
$ cat filename.bin | hxd
```

## Module Usage

```js
var Hxd = require('hxd')
```

```js
var hexStream = new Hxd({
  // Deduplicate lines and print "* {lineCount}"
  dedupe: true,
  // Render line numbers (in hexadecimal)
  lineNumbers: true,
  // Render ASCII
  ascii: true,
})

fs.createReadStream( filename )
  .pipe( hexStream )
  .pipe( process.stdout )
```
