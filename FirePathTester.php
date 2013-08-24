<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN">

<html>
<head>
<script src='https://ajax.googleapis.com/ajax/libs/jquery/1.9.0/jquery.min.js'></script>
<script src='https://cdn.firebase.com/v0/firebase.js'></script>
<script type="text/javascript" src="firepath.js"></script>
<script type="text/javascript">
function loadFullTree(){
	var fullTree = new FirePath('https://firepath-fb.firebaseIO.com//*');
	fullTree.once('value', function(dataSnapshot){

		pathElement = document.getElementById('paths');

		var regex = /^(https:\/\/|http:\/\/)[^\/]+|[^\/]+\[[^\]]+[^\/]+|[^\/]+|(?:\/\/)[^\/]+/g;
		var sections = new Array();
		var matched = null;
		var currentMatchElement = pathElement;
		var indent = 0;
		var currentLoc = "";
		while (matched = regex.exec(dataSnapshot.ref())) 
		{
			var toPush = matched[0];
			currentLoc = currentLoc + toPush;
			if(toPush.indexOf('//') == 0)
			{
				toPush = toPush.replace(/^\/\//,'/');
			}

			var tryGetElement = document.getElementById(currentLoc);
			if(tryGetElement)
			{
				currentMatchElement = tryGetElement;
			}
			else
			{
				currentMatchElement.innerHTML = currentMatchElement.innerHTML + "<div class='pathElement' id='" + currentLoc + "'>" + toPush + "</div>";
				currentMatchElement = document.getElementById(currentLoc);
				currentMatchElement.style.color = 'black';
				for(var j = 0; j < indent; j++)
				{
					currentMatchElement.innerHTML = "&nbsp;&nbsp;" + currentMatchElement.innerHTML;
				}
			}
			indent += 2;
		}
		if(typeof dataSnapshot.val() !== 'object')
		{
			finalMatchElement = document.getElementById(currentLoc);
			finalMatchElement.innerHTML = finalMatchElement.innerHTML + " = " + dataSnapshot.val()
		}
		//pathElement.innerHTML = pathElement.innerHTML + "<br>" + dataSnapshot.ref() + " = " + dataSnapshot.val();
	},function(){
		alert("fuck");
	},document);
}

function highlightTree() {
	$('#btn').prop('disabled', true);
	var test2 = $('.pathElement');
	test2.each(function (i) {
		this.style.color = "black";
	});

	var test = $('#path').val();
	var currentTree = new FirePath(test);


	var valueElement = document.getElementById('changer');

	var HighlightCallback = function(dataSnapshot){
		pathElement = document.getElementById('paths');

		var regex = /^(https:\/\/|http:\/\/)[^\/]+|[^\/]+\[[^\]]+[^\/]+|[^\/]+|(?:\/\/)[^\/]+/g;
		var sections = new Array();
		var matched = null;
		var currentMatchElement = pathElement;
		var currentLoc = "";
		while (matched = regex.exec(dataSnapshot.ref())) 
		{
			var toPush = matched[0];
			currentLoc = currentLoc + toPush;

			var tryGetElement = document.getElementById(currentLoc);
			if(tryGetElement)
			{
				tryGetElement.style.color = 'green';
				currentMatchElement = tryGetElement;
			}
			else
			{
				alert("error");
				break;
			}
		}
	};

	switch(valueElement.options[valueElement.selectedIndex].innerHTML)
	{
		case '':
			currentTree.once('value', HighlightCallback, function(){ alert("error"); }, document);
			break;
		case 'parent':
			currentTree.parent().once('value', HighlightCallback, function(){ alert("error"); }, document);
			break;
		case 'root':
			currentTree.root().once('value', HighlightCallback, function(){ alert("error"); }, document);
			break;
		//////////////////////////////////////////////////////
		case 'child':
			currentTree.child($('#valueInput').val()).once('value', HighlightCallback, function(){ alert("error"); }, document);
			break;
		case 'set':
			currentTree.set($('#valueInput').val(), function(){ location.reload(); });
			break;
		case 'update':
			currentTree.update($('#valueInput').val(), function(){ location.reload(); });
			break;
		case 'push':
			currentTree.push($('#valueInput').val(), function(){ location.reload(); });
			break;
		//////////////////////////////////////////////////////
		case 'remove':
			currentTree.remove(function(){ location.reload(); });
			break;
		//////////////////////////////////////////////////////
		case 'on':
			currentTree.on($('#eventTypePicker').val(), function (dataSnapshot) {
				var listenerText = document.getElementById('listenerContent')
				listenerText.innerHTML = listenerText.innerHTML + "Event fired on firebase ref: "+dataSnapshot.ref()+"<br>";
			});
			break;
		case 'off':
			currentTree.off($('#eventTypePicker').val());
			break;
		case 'once':
			currentTree.once($('#eventTypePicker').val(), function (dataSnapshot) {
				var listenerText = document.getElementById('listenerContent')
				listenerText.innerHTML = listenerText.innerHTML + "Event fired on firebase ref: "+dataSnapshot.ref()+"<br>";
			});
			break;
	}

	$('#btn').prop('disabled', false);
}

function selectChange(){
	var valueDivElement = document.getElementById('valueDiv');
	var valueElement = document.getElementById('changer');
	switch(valueElement.options[valueElement.selectedIndex].innerHTML)
	{
		case 'none':
		case 'parent':
		case 'root':
			$('#btn').html('Highlight');
			$('#valueDiv').attr("style", "display: none;");
			$('#valuePicker').attr("style", "display: none;");
			break;
		case 'child':
			$('#btn').html('Highlight');
			$('#valueDiv').attr("style", "display: inline-block;");
			$('#valuePicker').attr("style", "display: none;");
			break;
		case 'set':
		case 'update':
		case 'push':
			$('#btn').html('Execute');
			$('#valueDiv').attr("style", "display: inline-block;");
			$('#valuePicker').attr("style", "display: none;");
			break;
		case 'remove':
			$('#btn').html('Execute');
			$('#valueDiv').attr("style", "display: none;");
			$('#valuePicker').attr("style", "display: none;");
			break;
		case 'on':
		case 'off':
		case 'once':
			$('#btn').html('Test');
			$('#valueDiv').attr("style", "display: none;");
			$('#valuePicker').attr("style", "display: inline-block;");
			break;
	}
}
</script>

<title>Jason Brelloch CSC 8711 - Projects</title>

</head>

<body style="margin: 0px; padding: 0px; font-family: 'Trebuchet MS',verdana;">

<table width="100%" style="height: 100%;" cellpadding="10" cellspacing="0" border="0">
<tr>

<!-- ============ HEADER SECTION ============== -->
<td colspan="2" style="height: 100px;" bgcolor="#777d6a"><h1>CSC 8711</h1></td></tr>

<tr>
<!-- ============ LEFT COLUMN (MENU) ============== -->
<td style="width:150px;" valign="top" bgcolor="#999f8e">
<a href="index.php">Home</a><br>
<a href="projects.php">Projects</a><br>
<a href="about.php">About</a>
</td>

<!-- ============ RIGHT COLUMN (CONTENT) ============== -->
<td valign="top" bgcolor="#d2d8c7">

	<script type="text/javascript">
		//document.write('<pre>');
		loadFullTree();
		//document.write('</pre>');
	</script>
	<table cellspacing="20">
		<tr>
			<td valign="baseline">
				Path: <input type="text" id="path" style="width:300px;"><br/>
				Function: <select id="changer" onchange="selectChange()">
							  <option value="none"></option>
							  <option value="child">child</option>
							  <option value="parent">parent</option>
							  <option value="root">root</option>
							  <option value="set">set</option>
							  <option value="update">update</option>
							  <option value="remove">remove</option>
							  <option value="push">push</option>
							  <option value="on">on</option>
							  <option value="off">off</option>
							  <option value="once">once</option>
							</select>
				<div id='valueDiv' style="display: none;">Value: <input type="text" id='valueInput'></div>
				<div id='valuePicker' style="display: none;">Type: <select id="eventTypePicker">
							  <option value="value">value</option>
							  <option value="child_added">child added</option>
							  <option value="child_removed">child removed</option>
							  <option value="child_changed">child changed</option>
							  <option value="child_moved">child moved</option>
							</select>
				</div>
				<button id='btn' type="button" onclick="highlightTree()">Highlight</button>
				<p id='paths'></p>
			</td>
			<td width='500px' bgcolor="#E8ECE3" valign="baseline">
				<h3 align="center">Event Listeners</h3>
				<p id='listenerContent'>
				</p>
			</td>
		</tr>
	</table>
</body>

</html>