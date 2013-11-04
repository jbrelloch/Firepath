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


// location https://firepath-fb.firebaseio.com/a1/b1
// is now set to "stuff"
childRef.set("stuff", function(error){
	if(error){}
	else{}
});

// location https://firepath-fb.firebaseio.com/a1/b1
// is now set to "more stuff"
parentRef.update({b1:"more stuff"}, function(error){
	if(error){}
	else{}
});

// location https://firepath-fb.firebaseio.com/a1/b1
// now has a child set to "stuff". x is a reference
// to the new child
var x = childRef.push("stuff", function(error){
	if(error){}
	else{}
});

// location https://firepath-fb.firebaseio.com/a1/b1
// is removed along with all it's children
childRef.remove(function(error){
	if(error){}
	else{}
})


// location https://firepath-fb.firebaseio.com/a1
// now has a listener that will execute a callback on
// a change of value
var callback = function(dataSnapshot){};
parentRef.on('value', callback);

// location https://firepath-fb.firebaseio.com/a1
// now has a listener that will execute a callback on
// a child_added.  This will only fire once.
parentRef.once('child_added', function(dataSnapshot){});

// location https://firepath-fb.firebaseio.com/a1
// removes the callback function from 'value' listener 
parentRef.off('value', callback);


childRef.setWithPriority("stuff", 1000, function(error){});

childRef.setPriority(999, function(error){});

var query1 = childRef.startAt(1000);
var query2 = childRef.endAt(1000);
var query3 = childRef.startAt(1000).limit(10);

query.on('child_added', function(childSnapshot){});


childRef.setWithPriority("stuff", 1000, function(error){});

childRef.setWithPriority("stuff", 1000, function(error){});


// authenticates https://firepath-fb.firebaseio.com/
// with AUTH_TOKEN and then executes callback
dataRef.auth(AUTH_TOKEN, function(error, result){
	if(error){}
	else{}
});

// unauthenticates https://firepath-fb.firebaseio.com/
dataRef.unauth();

// executes an atomic transaction at firebase
// location https://firepath-fb.firebaseio.com/
dataRef.transaction(function(currentData){}, 
function(error, committed, snapshot){});