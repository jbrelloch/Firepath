<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN">

<html>
<head>
<script src='https://cdn.firebase.com/v0/firebase.js'></script>
<script type="text/javascript" src="firepath2.js"></script>
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
	
		var pathTest = new Firepath('https://firepath-fb.firebaseIO.com/*/b1[c2=1 and c1/d1=\'blah\']//d1', true);

		function clickme()
		{
			var test = pathTest.getRootPath();

			alert(test);
		}
	</script>

	<button onclick='clickme()'>Click Me!</button>
</body>

</html>