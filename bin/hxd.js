#!/usr/bin/env node
var Hxd = require( '../lib/hxd' )
var fs = require( 'fs' )
var argv = process.argv.slice(2)

var flags = argv.filter(( arg ) => {
  return /^-/.test( arg )
})

if( flags.includes( '-v' ) || flags.includes( '--version' ) ) {
  console.log( require( '../package.json' ).version )
  process.exit( 0 )
}

var options = {
  color: flags.includes( '--color' ) || process.stdout.isTTY
}

if( flags.includes( '--no-color' ) ) {
  options.color = false
}

argv = argv.filter(( arg ) => {
  return !/^-/.test( arg )
})

var filename = argv.shift()
var readStream = filename ?
  fs.createReadStream( filename ) :
  process.stdin

var hexdump = new Hxd( options )

readStream.on('error', function( error ) {
  var ansi = require( 'ansi-styles' )
  var os = require( 'os' )
  console.error( `${ansi.red.open}[ERROR]${ansi.red.close} ${error.message}` )
  process.exit( os.constants.errno[error.code] || 1 )
})

readStream.pipe( hexdump )
  .pipe( process.stdout )
  .on( 'error', function( error ) {
    if( error.code === 'EPIPE' ) {
      readStream.destroy()
    }
  })
