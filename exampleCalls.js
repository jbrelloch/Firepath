

var dataRef = new Firebase('https://firepath-fb.firebaseio.com/');


//new firebase reference to https://firepath-fb.firebaseio.com/a1/b1
var childRef = dataRef.child('a1/b1');


//new firebase reference to https://firepath-fb.firebaseio.com/a1/
var parentRef = childRef.parent();


//new firebase reference to https://firepath-fb.firebaseio.com/
var rootRef = childRef.root();


//x = 'b1'
var x = childRef.name();


//y = 'https://firepath-fb.firebaseio.com/'
var y = dataRef.toString();