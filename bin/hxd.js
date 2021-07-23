#!/usr/bin/env node
var Hxd = require( '../lib/hxd' )
var fs = require( 'fs' )
var argv = process.argv.slice(2)

function hasOpt( short, long ) {
  return argv.includes( short ) ||
    argv.includes( long )
}

function getOpt( short, long ) {
  if( argv.includes( short ) )
    return argv[ argv.indexOf( short ) + 1 ]
  if( argv.includes( long ) )
    return argv[ argv.indexOf( long ) + 1 ]
}

function parseNumber( value ) {
  value = value + ''
  if( /^-?0x/i.test( value ) ) {
    return parseInt( value.replace( /^0x/i, '' ), 16 )
  }
  if( /-?\d+\s*[KMGTPE]?B?/i.test( value ) ) {
    var match = /^(-?\d+)\s*([KMGTPE]?)B?/i.exec( value )
    var number = parseInt( match[1], 10 )
    if( match[2] ) {
      number *= parseNumber.unit[ match[2].toUpperCase() ]
    }
    return number
  }
  return parseInt( value, 10 )
}

parseNumber.unit = {
  K: 1024,
  M: 1024 * 1024,
  G: 1024 * 1024 * 1024,
  T: 1024 * 1024 * 1024 * 1024,
  P: 1024 * 1024 * 1024 * 1024,
  E: 1024 * 1024 * 1024 * 1024 * 1024,
}

if( hasOpt( '-v', '--version' ) ) {
  console.log( require( '../package.json' ).version )
  process.exit( 0 )
}

if( hasOpt( '-h', '--help' ) ) {
  const USAGE = `
  Usage: hxd [options] [file]

  Options

    -h, --help      Display help
    -v, --version   Display version number

    -s, --start     Start reading at the given offset
    -e, --end       Read until the given offset
    -l, --length    Read "length" bytes from start

    -b, --binary    Binary digit dump
    --color         Render output with color
    --no-color      Force-disable color output
    --prefix        Prefix output lines with a given value`
  console.log( USAGE )
  process.exit( 0 )
}

var filename = argv.pop()
var stats = filename ? fs.statSync( filename ) : {}

var readOptions = {
  start: hasOpt( '-s', '--start' ) ?
    parseNumber( getOpt( '-s', '--start' ) ) : 0,
  end: hasOpt( '-e', '--end' ) ?
    parseNumber( getOpt( '-e', '--end' ) ) - 1 : stats.size,
}

if( hasOpt( '-l', '--length' ) ) {
  readOptions.end = ( readOptions.start || 0 ) +
    parseNumber( getOpt( '-l', '--length' ) ) - 1
}

if( readOptions.start && readOptions.start < 0 ) {
  readOptions.start += stats.size
}

if( readOptions.end && readOptions.end < 0 ) {
  readOptions.end += stats.size
}

var options = {
  lineNumbers: true,
  dedupe: true,
  ascii: true,
  offset: readOptions.start || 0,
  binary: false,
  colors: hasOpt( '--color' ) || process.stdout.isTTY,
  prefix: getOpt( '--prefix' ),
}

if( hasOpt( '--no-color' ) ) {
  options.color = false
}

if( hasOpt( '-b', '--binary' ) ) {
  options.binary = true
}

var readStream = filename ?
  fs.createReadStream( filename, readOptions ) :
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
