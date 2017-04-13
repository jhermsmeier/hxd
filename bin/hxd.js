#!/usr/bin/env node
var Hxd = require( '../lib/hxd' )
var fs = require( 'fs' )
var argv = process.argv.slice(2)

var filename = argv.shift()
var readStream = filename ?
  fs.createReadStream( filename ) :
  process.stdin

readStream.pipe( new Hxd() )
  .pipe( process.stdout )
