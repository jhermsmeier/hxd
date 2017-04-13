var Stream = require( 'stream' )

class Hxd extends Stream.Transform {

  constructor( options = {} ) {

    // Use same highWaterMark as fs.ReadStream
    options.highWaterMark = 64 * 1024

    super( options )

    this.dedupe = options.dedupe == null ?
      true : options.dedupe
    this.lineNumbers = options.lineNumbers == null ?
      true : options.lineNumbers
    this.ascii = options.ascii == null ?
      true : options.ascii

    // Internal states
    this.lineno = 0
    this.buffer = new Buffer(0)
    this.hex = ''
    this.repetitions = 0
    this.lineBuffer = []
    this.maxLines = 256

  }

  _output( line ) {
    this.lineBuffer.push( line + '\n')
    if( this.lineBuffer.length >= this.maxLines ) {
      this.push( this.lineBuffer.join('') )
      this.lineBuffer.length = 0
    }
  }

  _dedupe( hex ) {
    if( this.dedupe == false ) {
      return false
    } else if( this.hex === hex ) {
      this.repetitions++
      return true
    } else if( this.repetitions > 0 ) {
      this._output( ` * ${this.repetitions}` )
      this.lineno += this.repetitions * 16
      this.repetitions = 0
      return false
    }
  }

  _process( chunk ) {

    var offset = 0
    var hex = ''
    var line = ''

    this.buffer += chunk.toString( 'hex' )

    while( offset < this.buffer.length ) {
      hex = this.buffer.substring( offset, offset += 32 )
      if( this._dedupe( hex ) ) continue
      this.hex = hex
      line = this.lineNumbers ? Hxd.lineno( this.lineno ) + '  ' : ''
      line += Hxd.hexCols( hex )
      line += this.ascii ? '  | ' + Hxd.ascii( hex ) + ' |' : ''
      this._output( line )
      this.lineno += 16
    }

    this.buffer = this.buffer.substring( offset )

  }

  _transform( chunk, _, next ) {
    this._process( chunk )
    next()
  }

  _flush( done ) {
    // Replacing undefined is a total fucking hack, but hey – it works,
    // and doesn't impact performance this way
    this.push( this.lineBuffer.join('').replace( /undefined/g, ' ' ) )
    this.lineBuffer.length = 0
    done()
  }

}

Hxd.upperCase = function(s) {
  return s.toUpperCase()
}

// This clocks in at ~800ms, whereas the below
// clocks in at ~10-15ms – per 1.000.000 ops – HOLY SHIT!
// Hxd.hexCols = function(hex) {
//   var out = ''
//   for( var i = 0; i < 32; i++ ) {
//     out += i % 2 ? hex[i] + ' ' : hex[i]
//   }
//   return out
// }

Hxd.hexCols = function(hex) {
  var i = 0
  return hex[i++] + hex[i++] + ' ' + hex[i++] + hex[i++] + ' ' +
    hex[i++] + hex[i++] + ' ' + hex[i++] + hex[i++] + ' ' +
    hex[i++] + hex[i++] + ' ' + hex[i++] + hex[i++] + ' ' +
    hex[i++] + hex[i++] + ' ' + hex[i++] + hex[i++] + ' ' +
    hex[i++] + hex[i++] + ' ' + hex[i++] + hex[i++] + ' ' +
    hex[i++] + hex[i++] + ' ' + hex[i++] + hex[i++] + ' ' +
    hex[i++] + hex[i++] + ' ' + hex[i++] + hex[i++] + ' ' +
    hex[i++] + hex[i++] + ' ' + hex[i++] + hex[i++]
}

// You'd think this is fast, but nope – see below
// Hxd.lineno = function( number ) {
//   return ( '00000000' + Hxd.hex( number ) ).substr( -8 )
// }

const lineno = Buffer.allocUnsafeSlow(4)

// The second slowest kid on the block
// with ~500-600 ms per million ops.
// Not sure if there's a faster way to do this
Hxd.lineno = function( number ) {
  lineno.writeUInt32BE( number, 0 )
  return lineno.toString( 'hex' )
}

const chunk = Buffer.allocUnsafeSlow(16)
const table = ( ' !"#$%&\'()*+,-./0123456789:;<=>?@' +
  'ABCDEFGHIJKLMNOPQRSTUVWXYZ' + '[\\]^_`' +
  'abcdefghijklmnopqrstuvwxyz' + '{|}~' ).split('')

Hxd.asciiChar = function( code ) {
  return code >= 0x20 && code <= 0x7E ?
    table[ code - 0x20 ] : '.'
}

Hxd.rightPad = function( str, chr, count ) {
  while( count-- ) str = str + chr
  return str
}

// Slowest one, ~750 ms per million ops,
// but still the fastest way I could figure out
Hxd.ascii = function( hex ) {

  var out = ''
  var length = hex.length / 2

  chunk.write( hex, 'hex' )

  for( var i = 0; i < length; i++ ) {
    out = out + Hxd.asciiChar( chunk[i] )
  }

  length = 16 - length

  return length ? Hxd.rightPad( out, ' ', length ) : out

}

module.exports = Hxd