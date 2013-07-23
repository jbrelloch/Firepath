<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN">

<html>
<head>
<script src='https://cdn.firebase.com/v0/firebase.js'></script>
<script type="text/javascript" src="firepath.js"></script>
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
		document.write('<pre>');
		document.writeln('***************************************************<br/>');
		var pathTest = new FirePath('https://firepath-fb.firebaseIO.com/*/b1[k and c1/d1=\'blah\']//d1');
		//var pathTest = new FirePath('https://firepath-fb.firebaseIO.com/a1//*/d1');
		document.writeln('<br/>***************************************************<br/>');
		document.writeln('<br/>FUNCTION TESTS<br/>');
		document.writeln('***************************************************<br/>');
		document.writeln('.child(childPath)<br/>---------------------------------------------------<br/>');
		document.writeln(pathTest.child('test1').toString()+'<br/>---------------------------------------------------<br/>');
		document.writeln(pathTest.child('/test2').toString()+'<br/>---------------------------------------------------<br/>');
		document.writeln(pathTest.child('//test3').toString()+'<br/>***************************************************<br/>');
		document.writeln('.parent()<br/>---------------------------------------------------<br/>');
		document.writeln(pathTest.parent().toString()+'<br/>***************************************************<br/>');
		document.writeln('.root()<br/>---------------------------------------------------<br/>');
		document.writeln(pathTest.root().toString()+'<br/>***************************************************<br/>');
		document.writeln('.name()<br/>---------------------------------------------------<br/>');
		document.writeln(pathTest.name()+'<br/>***************************************************<br/>');
		document.writeln('.toString()<br/>---------------------------------------------------<br/>');
		document.writeln(pathTest.toString()+'<br/>***************************************************<br/>');
		document.writeln('.processPath()<br/>---------------------------------------------------<br/>');
		pathTest.set('placeholder',function(returned){
			document.writeln(returned+'<br/>***************************************************<br/>');
			document.write('</pre>');
		});
	</script>

</body>

</html>