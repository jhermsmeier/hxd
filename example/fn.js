var Hxd = require( '..' )

function hexdump( input, callback ) {

  var dump = ''
  var hxd = new Hxd({
    dedupe: false,
    colors: false,
    ascii: true,
  })

  hxd.on( 'readable', function() {
    var chunk = null
    while(( chunk = this.read() )) {
      dump += chunk
    }
  })

  hxd.once( 'end', () => {
    var lines = dump.trim().split( /\r?\n/g )
    callback( null, lines )
  })

  hxd.end( input )

}

hexdump( process.argv.slice( 2 ).join( ' ' ), ( error, lines ) => {
  console.log( error || lines )
})
