#!/usr/bin/env node
var Hxd = require( '../lib/hxd' )
var fs = require( 'fs' )
var argv = process.argv.slice(2)

if( argv.includes( '-v' ) || argv.includes( '--version' ) ) {
  console.log( require( '../package.json' ).version )
  process.exit( 0 )
}

var filename = argv.shift()
var readStream = filename ?
  fs.createReadStream( filename ) :
  process.stdin

readStream.pipe( new Hxd() )
  .pipe( process.stdout )
  .on( 'error', function( error ) {
    if( error.code === 'EPIPE' ) {
      readStream.destroy()
    }
  })
