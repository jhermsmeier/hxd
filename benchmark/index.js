var bench = require( 'nanobench' )
var Hxd = require( '..' )

const ITERATIONS = 1000000

bench( `Hxd.lineno() ⨉ ${ITERATIONS}`, function( run ) {

  var input = Math.random() * Math.pow(2,32)
  var output = null

  run.start()
  for( var i = 0; i < ITERATIONS; i++ ) {
    output = Hxd.lineno( input )
  }
  run.end()

})

bench( `Hxd.hexCols() ⨉ ${ITERATIONS}`, function( run ) {

  var hex = require('crypto').randomBytes(16).toString('hex')
  var output = null

  run.start()
  for( var i = 0; i < ITERATIONS; i++ ) {
    output = Hxd.hexCols( hex )
  }
  run.end()

})

bench( `Hxd.upperCase() ⨉ ${ITERATIONS}`, function( run ) {

  var hex = require('crypto').randomBytes(16).toString('hex')
  var output = null

  run.start()
  for( var i = 0; i < ITERATIONS; i++ ) {
    output = Hxd.upperCase( hex )
  }
  run.end()

})

bench( `Hxd.ascii() ⨉ ${ITERATIONS}`, function( run ) {

  var hex = require('crypto').randomBytes(16).toString('hex')
  var output = null

  run.start()
  for( var i = 0; i < ITERATIONS; i++ ) {
    output = Hxd.ascii( hex )
  }
  run.end()

})
