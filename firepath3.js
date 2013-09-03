var DEBUG = false;

var FirePathSectionRuleType = { "path": 0, 
             "string": 1, 
             "number": 2,
             "operator": 3,
             "conjunction": 4,
             "rulePart": 5,
             "processed": 6 };

function FirePath(path, optDEBUG)
{
	if(optDEBUG != null)
		DEBUG = optDEBUG;

	var parser = new FirePathParser();

	var pathSections = parser.parse(path);

	var basePath = path;

	var fireBasePaths = [];

	this.getCurrentPaths = function(){
		return fireBasePaths;
	};

	function processRule(pathStrings,count,callback)
	{
		var newPathStrings = [];

		var finishCount = 0;
		for (var j = 0; j < pathStrings.length; j++) 
		{
			var currentDataRef = new Firebase(pathStrings[j]);

			!function closure2(j){
				currentDataRef.once('value', function(dataSnapshot) {
					
					//alert("basePath: "+pathStrings[j]+" current section: "+pathSections[count].name+" rule to test: "+pathSections[count].rule);
					var testResult = testRulePart(pathSections[count].rule, dataSnapshot);
					//alert("result: "+testResult);
					if((testResult != null)?testResult:false)
					{
						newPathStrings.push(pathStrings[j]);
					}

					finishCount++;
					if(finishCount == pathStrings.length)
					{
						count++;
						processPath(newPathStrings,count,callback);
					}
				});
			}(j)
		}
	}

	function testRulePart(rule,snapShotBase)
	{
		//alert("processing rule: "+rule+" from ref: "+snapShotBase.ref().toString());
		var tempRuleType = rule.elementType.slice(0);
		var tempRuleValue = rule.elementValue.slice(0);
		var ultimateFail = false;
		//order is ruleParts,paths,operators,conjunctions
		for (var i = 0; i < 4; i++) {
			//alert("Outer loop count: "+i);
			var notDone = true;
			var pointer = 0;
			while(notDone)
			{
				//alert("Inner loop count: "+pointer+" ruleType: "+tempRuleType[pointer]+" conj rule type: "+FirePathSectionRuleType.conjunction);
				if(i==0 && tempRuleType[pointer]==FirePathSectionRuleType.rulePart)
				{
					try
					{
						tempRuleValue[pointer] = testRulePart(tempRuleValue[pointer],snapShotBase);
						tempRuleType[pointer] = FirePathSectionRuleType.processed;
					}
					catch(err)
					{
						ultimateFail = true;
					}
				}
				else if(i==1 && tempRuleType[pointer]==FirePathSectionRuleType.path)
				{
					//alert("resolving path: "+tempRuleValue[pointer]+" from ref: "+snapShotBase.ref().toString());
					try
					{
						tempRuleValue[pointer] = snapShotBase.child(tempRuleValue[pointer]).val();
						tempRuleType[pointer] = FirePathSectionRuleType.string;
					}
					catch(err)
					{
						ultimateFail = true;
					}
					//alert("path resolved: "+tempRuleValue[pointer]);
				}
				else if(i==2 && tempRuleType[pointer]==FirePathSectionRuleType.operator)
				{
					//alert("resolving operator: "+tempRuleValue[pointer]+" between: "+tempRuleValue[pointer-1]+" and "+tempRuleValue[pointer+1]);
					try
					{
						var tempHolder = null;
						if(tempRuleValue[pointer] == "=")
						{
							tempHolder = (tempRuleValue[pointer-1] == tempRuleValue[pointer+1]);
						}
						else if(tempRuleValue[pointer] == "<=")
						{
							tempHolder = (tempRuleValue[pointer-1] <= tempRuleValue[pointer+1]);
						}
						else if(tempRuleValue[pointer] == ">=")
						{
							tempHolder = (tempRuleValue[pointer-1] >= tempRuleValue[pointer+1]);
						}
						else if(tempRuleValue[pointer] == "!=")
						{
							tempHolder = (tempRuleValue[pointer-1] != tempRuleValue[pointer+1]);
						}
						tempRuleValue.splice(pointer-1,3,tempHolder);
						tempRuleType.splice(pointer-1,3,FirePathSectionRuleType.processed);
						pointer--;
					}
					catch(err)
					{
						ultimateFail = true;
					}
					//alert("resolved operator: "+tempRuleValue[pointer]);
				}
				else if(i==3 && tempRuleType[pointer]==FirePathSectionRuleType.conjunction)
				{
					//alert("resolving conjunction: "+tempRuleValue[pointer]+" between: "+tempRuleValue[pointer-1]+" and "+tempRuleValue[pointer+1]);
					try
					{
						var tempHolder = null;
						if(tempRuleType[pointer-1] == FirePathSectionRuleType.processed
							&& tempRuleType[pointer+1] == FirePathSectionRuleType.processed)
						{
							if(tempRuleValue[pointer] == "and")
							{
								tempHolder = (tempRuleValue[pointer-1] && tempRuleValue[pointer+1]);
							}
							else if(tempRuleValue[pointer] == "or")
							{
								tempHolder = (tempRuleValue[pointer-1] || tempRuleValue[pointer+1]);
							}
							tempRuleValue.splice(pointer-1,3,tempHolder);
							tempRuleType.splice(pointer-1,3,FirePathSectionRuleType.processed);
							pointer--;
						}
						else
						{
							if(DEBUG)
							{
								alert("error in rule");
							}
						}
					}
					catch(err)
					{
						ultimateFail = true;
					}
					//alert("resolved conjunction: "+tempRuleValue[pointer]);
				}
				pointer++;
				if(pointer > tempRuleValue.length)
				{
					notDone = false;
				}
				//alert("current value array: "+tempRuleValue+" current type array: "+tempRuleType);
			}
		}
		if(tempRuleValue.length > 1 || ultimateFail)
		{
			return null;
		}
		else
		{
			return tempRuleValue[0];
		}
	}

	function processPath(pathStrings,count,callback)
	{
		var newPathStrings = [];

		if(count >= pathSections.length)
		{
			fireBasePaths = [];
			for (var j = 0; j < pathStrings.length; j++) 
			{
				var fbToAdd = new Firebase(pathStrings[j]);
				fireBasePaths.push(fbToAdd);
			}
			return (callback());
		}

		if(count == 0)
		{
			//first section is always the firebase root address (no rules allowed)
			newPathStrings.push(pathSections[count].name);
			count++;
			processPath(newPathStrings,count,callback);
		}
		else if(/^\/.+/.test(pathSections[count].name))
		{
			//search everywhere below this node (// operator found)
			if(/^\/\*$/.test(pathSections[count].name))
			{
				//double slash operator plus a star operator
				//add every node below the current one
				var finishCount = 0;
				for (var j = 0; j < pathStrings.length; j++) 
				{
					var currentDataRef = new Firebase(pathStrings[j]);

					!function closure2(j){
						var doubleSlashStarCallback = function(dataSnapshot) {
							var notDone = true;
							var snapsToSearch = [dataSnapshot];
							var newSnapsToSearch = [];

							while(notDone)
							{
								notDone = false;
								for (var k = 0; k < snapsToSearch.length; k++) 
								{
									snapsToSearch[k].forEach(function(childSnapshot){
										newSnapsToSearch.push(childSnapshot);
										newPathStrings.push(childSnapshot.ref().toString());
									});
								}

								if(newSnapsToSearch.length > 0)
								{
									notDone = true;
								}
								snapsToSearch = newSnapsToSearch;
								newSnapsToSearch = [];
							}
							finishCount++;
							if(finishCount == pathStrings.length)
							{
								if(pathSections[count].rule != null)
								{
									processRule(newPathStrings,count,callback);
								}
								else
								{
									count++;
									processPath(newPathStrings,count,callback);
								}
							}
						}

						//currentDataRef.on('value', doubleSlashStarCallback);
						currentDataRef.on('child_added', doubleSlashStarCallback);
						currentDataRef.on('child_removed', doubleSlashStarCallback);
						currentDataRef.on('child_changed', doubleSlashStarCallback);
						//currentDataRef.on('child_moved', doubleSlashStarCallback);
					}(j)
				}
			}
			else
			{
                //just a double slash operator, every node at any level that matches
				var finishCount = 0;
				for (var j = 0; j < pathStrings.length; j++) 
				{
					var currentDataRef = new Firebase(pathStrings[j]);

					!function closure4(j){
						currentDataRef.once('value', function(dataSnapshot) {
							var notDone = true;
							var snapsToSearch = [dataSnapshot];
							var newSnapsToSearch = [];

							while(notDone)
							{
								notDone = false;
								for (var k = 0; k < snapsToSearch.length; k++) 
								{
									snapsToSearch[k].forEach(function(childSnapshot){
										newSnapsToSearch.push(childSnapshot);
										if(childSnapshot.name() == pathSections[count].name.slice(1))
										{
											newPathStrings.push(childSnapshot.ref().toString());
										}
									});
								}

								if(newSnapsToSearch.length > 0)
								{
									notDone = true;
								}
								snapsToSearch = newSnapsToSearch;
								newSnapsToSearch = [];
							}
							finishCount++;
							if(finishCount == pathStrings.length)
							{
								if(pathSections[count].rule != null)
								{
									processRule(newPathStrings,count,callback);
								}
								else
								{
									count++;
									processPath(newPathStrings,count,callback);
								}
							}
						});
					}(j)
				}
			}
		}
		else if(/^\*$/.test(pathSections[count].name))
		{
            //star operator, match every node at current level
			var finishCount = 0;
			for (var j = 0; j < pathStrings.length; j++) 
			{
				var currentDataRef = new Firebase(pathStrings[j]);

				!function closure6(j){
					currentDataRef.once('value', function(dataSnapshot) {
						dataSnapshot.forEach(function(childSnapshot) {
							newPathStrings.push(pathStrings[j]+'/'+childSnapshot.name());
						});
						finishCount++;
						if(finishCount == pathStrings.length)
						{
							if(pathSections[count].rule != null)
							{
								processRule(newPathStrings,count,callback);
							}
							else
							{
								count++;
								processPath(newPathStrings,count,callback);
							}
						}
					});
				}(j)
			}
		}
		else
		{
			var finishCount = 0;
			for (var j = 0; j < pathStrings.length; j++) 
			{
				var currentDataRef = new Firebase(pathStrings[j]);

				!function closure8(j){
					currentDataRef.once('value', function(dataSnapshot) {
						if(dataSnapshot.hasChild(pathSections[count].name))
						{
							newPathStrings.push(dataSnapshot.child(pathSections[count].name).ref().toString());
						}
						finishCount++;
						if(finishCount == pathStrings.length)
						{
							if(pathSections[count].rule != null)
							{
								processRule(newPathStrings,count,callback);
							}
							else
							{
								count++;
								processPath(newPathStrings,count,callback);
							}
						}
					});
				}(j)
			}
		}
	}

	//DEBUG SECTION//////////////////////
	if(DEBUG)
	{
		var i=0;
		while(i < pathSections.length)
		{
			if(pathSections[i].rule !== null)
			{
				document.writeln('name= ('+pathSections[i].name+') rule= ('+pathSections[i].rule.toString()+')');
				writeRule(pathSections[i].rule,1);
			}
			else
			{
				document.writeln('name= ('+pathSections[i].name+') rule= (null)');
			}
			i++;
		}
		document.write('<br>');

		function writeRule(ruleToWrite,indentLevel)
		{
			var j = 0;
			while(j < ruleToWrite.elementValue.length)
			{
				if(ruleToWrite.elementType[j] == FirePathSectionRuleType.rulePart)
				{
					var stringToWrite = 'type= ('+ruleToWrite.elementType[j]+') value= ('+ruleToWrite.elementValue[j].toString()+')';
					for(var k=0;k<indentLevel;k++)
					{
						stringToWrite = '    '+stringToWrite;
					}
					document.writeln(stringToWrite);
					writeRule(ruleToWrite.elementValue[j],indentLevel+1);
				}
				else
				{
					var stringToWrite = 'type= ('+ruleToWrite.elementType[j]+') value= ('+ruleToWrite.elementValue[j]+')';
					for(var k=0;k<indentLevel;k++)
					{
						stringToWrite = '    '+stringToWrite;
					}
					document.writeln(stringToWrite);
				}
				j++;
			}
		}
	}
	/////////////////////////////////////

	this.child = function(childPath)
	{
		if(childPath.indexOf('//') == 0)//starts with '//'
		{
			var trimmedBasePath = basePath.replace(/\/+$/,'');
			var newPath = trimmedBasePath+childPath;
			return new FirePath(newPath);
		}
		else if(childPath.indexOf('/') == 0)//starts with '/'
		{
			var trimmedBasePath = basePath.replace(/\/+$/,'');
			var newPath = trimmedBasePath+childPath;
			return new FirePath(newPath);
		}
		else
		{
			var trimmedBasePath = basePath.replace(/\/+$/,'');
			var newPath = trimmedBasePath+'/'+childPath;
			return new FirePath(newPath);
		}
	};
	this.parent = function()//MAY NEED TO RETHINK THIS ONE ((https://firepath-fb.firebaseio.com/*/b1).parent() 
							//								--- is this https://firepath-fb.firebaseio.com/* OR https://firepath-fb.firebaseio.com/*[b1 exists])
	{
		if(pathSections.length === 1)
		{
			return null;
		}
		else
		{
			var newPath = '';
			for(var i=0;i<pathSections.length-1;i++)
			{
				//first add name bit
				newPath = newPath+pathSections[i].name;
				//second add a rule if it exists
				if(pathSections[i].rule === null)
				{
					newPath = newPath+'/';
				}
				else
				{
					newPath = newPath+'['+pathSections[i].rule+']/';
				}
			}
			return new FirePath(newPath);
		}
	};
	this.root = function()
	{
		//the first element in sections is the root
		return new FirePath(pathSections[0].name); 
	};
	this.name = function()
	{
		return pathSections[pathSections.length-1].name;
	};
	this.toString = function()
	{
		return basePath;
	};
	this.set = function(value,optOnComplete)
	{
		processPath([],0,function(){
			var finishCount = 0;
			var errors = [];
			if(fireBasePaths.length > 0)//OUTER IF SUBJECT TO CHANGE (what do we do when no path's are found?)
			{
				for (var i = 0; i < fireBasePaths.length; i++) 
				{
					fireBasePaths[i].set(value,function(error){
						errors.push(error);
						finishCount++;
						if(finishCount == fireBasePaths.length)
						{
							if(optOnComplete != null){
								return optOnComplete(errors);
							}
						}
					});
				};
			}
			else
			{
				alert('No paths found!');
			}
		});
	};
	this.update = function(value,optOnComplete)
	{
		processPath([],0,function(){
			var finishCount = 0;
			var errors = [];
			if(fireBasePaths.length > 0)//OUTER IF SUBJECT TO CHANGE (what do we do when no path's are found?)
			{
				for (var i = 0; i < fireBasePaths.length; i++) 
				{
					fireBasePaths[i].update(value,function(error){
						errors.push(error);
						finishCount++;
						if(finishCount == fireBasePaths.length)
						{
							if(optOnComplete != null){
								return optOnComplete(errors);
							}
						}
					});
				};
			}
			else
			{
				alert('No paths found!');
			}
		});
	};
	this.remove = function(optOnComplete)
	{
		processPath([],0,function(){
			var finishCount = 0;
			var errors = [];
			if(fireBasePaths.length > 0)//OUTER IF SUBJECT TO CHANGE (what do we do when no path's are found?)
			{
				for (var i = 0; i < fireBasePaths.length; i++) 
				{
					fireBasePaths[i].remove(function(error){
						errors.push(error);
						finishCount++;
						if(finishCount == fireBasePaths.length)
						{
							if(optOnComplete != null){
								return optOnComplete(errors);
							}
						}
					});
				};
			}
			else
			{
				alert('No paths found!');
			}
		});
	};
	//Value is supposed to be optional, but i need the callback and I 
	// dont think it will work with a callback without a value
	this.push = function(value,optOnComplete)
	{
		processPath([],0,function(){
			var finishCount = 0;
			var errors = [];
			if(fireBasePaths.length > 0)//OUTER IF SUBJECT TO CHANGE (what do we do when no path's are found?)
			{
				for (var i = 0; i < fireBasePaths.length; i++) 
				{
					fireBasePaths[i].push(value,function(error){
						errors.push(error);
						finishCount++;
						if(finishCount == fireBasePaths.length)
						{
							if(optOnComplete != null){
								return optOnComplete(errors);
							}
						}
					});
				};
			}
			else
			{
				alert('No paths found!');
			}
		});
	};
	this.on = function(eventType,callback,optCancelCallback,optContext)
	{
		processPath([],0,function(){
			var finishCount = 0;
			var errors = [];
			if(fireBasePaths.length > 0)//OUTER IF SUBJECT TO CHANGE (what do we do when no path's are found?)
			{
				for (var i = 0; i < fireBasePaths.length; i++) 
				{
					switch(eventType)
					{
						case 'value':
						case 'child_removed':
							if(optCancelCallback != null && optContext != null)
							{
								fireBasePaths[i].on(eventType,function(dataSnapshot){
									callback(dataSnapshot);
								},function(){
									optCancelCallback()
								},optContext);
							}
							else if(optCancelCallback != null)
							{
								fireBasePaths[i].on(eventType,function(dataSnapshot){
									callback(dataSnapshot);
								},function(){
									optCancelCallback()
								});
							}
							else if(optContext != null)
							{
								fireBasePaths[i].on(eventType,function(dataSnapshot){
									callback(dataSnapshot);
								},optContext);
							}
							else
							{
								fireBasePaths[i].on(eventType,function(dataSnapshot){
									callback(dataSnapshot);
								});
							}
							break;
						case 'child_added':
						case 'child_changed':
						case 'child_moved':
							if(optCancelCallback != null && optContext != null)
							{
								fireBasePaths[i].on(eventType,function(childSnapshot, prevSnapshot){
									callback(childSnapshot, prevSnapshot);
								},function(){
									optCancelCallback()
								},optContext);
							}
							else if(optCancelCallback != null)
							{
								fireBasePaths[i].on(eventType,function(childSnapshot, prevSnapshot){
									callback(childSnapshot, prevSnapshot);
								},function(){
									optCancelCallback()
								});
							}
							else if(optContext != null)
							{
								fireBasePaths[i].on(eventType,function(childSnapshot, prevSnapshot){
									callback(childSnapshot, prevSnapshot);
								},optContext);
							}
							else
							{
								fireBasePaths[i].on(eventType,function(childSnapshot, prevSnapshot){
									callback(childSnapshot, prevSnapshot);
								});
							}
							break;
					}
				};
			}
			else
			{
				alert('No paths found!');
			}
		});
	};
	this.off = function(optEventType,optCallback,optContext)
	{
		processPath([],0,function(){
			var finishCount = 0;
			var errors = [];
			if(fireBasePaths.length > 0)//OUTER IF SUBJECT TO CHANGE (what do we do when no path's are found?)
			{
				for (var i = 0; i < fireBasePaths.length; i++) 
				{
					switch(optEventType)
					{
						case 'value':
						case 'child_removed':
							if(optCallback != null && optContext != null)
							{
								fireBasePaths[i].off(optEventType,function(dataSnapshot){
									optCallback(dataSnapshot);
								},optContext);
							}
							else if(optCallback != null)
							{
								fireBasePaths[i].off(optEventType,function(dataSnapshot){
									optCallback(dataSnapshot);
								});
							}
							else if(optContext != null)
							{
								fireBasePaths[i].off(optEventType,optContext);
							}
							else
							{
								fireBasePaths[i].off(optEventType);
							}
							break;
						case 'child_added':
						case 'child_changed':
						case 'child_moved':
							if(optCallback != null && optContext != null)
							{
								fireBasePaths[i].off(optEventType,function(dataSnapshot){
									optCallback(dataSnapshot);
								},optContext);
							}
							else if(optCallback != null)
							{
								fireBasePaths[i].off(optEventType,function(dataSnapshot){
									optCallback(dataSnapshot);
								});
							}
							else if(optContext != null)
							{
								fireBasePaths[i].off(optEventType,optContext);
							}
							else
							{
								fireBasePaths[i].off(optEventType);
							}
							break;
						default:
							fireBasePaths[i].off();
					}
				};
			}
			else
			{
				alert('No paths found!');
			}
		});
	};
	this.once = function(eventType,successCallback,optFailureCallback,optContext)
	{
		processPath([],0,function(){
			var finishCount = 0;
			var errors = [];
			if(fireBasePaths.length > 0)//OUTER IF SUBJECT TO CHANGE (what do we do when no path's are found?)
			{
				for (var i = 0; i < fireBasePaths.length; i++) 
				{
					switch(eventType)
					{
						case 'value':
						case 'child_removed':
							if(optFailureCallback != null && optContext != null)
							{
								fireBasePaths[i].once(eventType,function(dataSnapshot){
									successCallback(dataSnapshot);
								},function(){
									optFailureCallback()
								},optContext);
							}
							else if(optFailureCallback != null)
							{
								fireBasePaths[i].once(eventType,function(dataSnapshot){
									successCallback(dataSnapshot);
								},function(){
									optFailureCallback()
								});
							}
							else if(optContext != null)
							{
								fireBasePaths[i].once(eventType,function(dataSnapshot){
									successCallback(dataSnapshot);
								},optContext);
							}
							else
							{
								fireBasePaths[i].once(eventType,function(dataSnapshot){
									successCallback(dataSnapshot);
								});
							}
							break;
						case 'child_added':
						case 'child_changed':
						case 'child_moved':
							if(optFailureCallback != null && optContext != null)
							{
								fireBasePaths[i].once(eventType,function(childSnapshot, prevSnapshot){
									successCallback(dataSnapshot);
								},function(){
									optFailureCallback()
								},optContext);
							}
							else if(optFailureCallback != null)
							{
								fireBasePaths[i].once(eventType,function(childSnapshot, prevSnapshot){
									successCallback(dataSnapshot);
								},function(){
									optFailureCallback()
								});
							}
							else if(optContext != null)
							{
								fireBasePaths[i].once(eventType,function(childSnapshot, prevSnapshot){
									successCallback(dataSnapshot);
								},optContext);
							}
							else
							{
								fireBasePaths[i].once(eventType,function(childSnapshot, prevSnapshot){
									successCallback(dataSnapshot);
								});
							}
							break;
					}
				};
			}
			else
			{
				alert('No paths found!');
			}
		});
	};

	//may or may not support these
	this.transaction = function(updateFunction,optOnComplete,optApplyLocally){};
	this.limit = function(limit){};
	this.startAt = function(optPriority,optName){};
	this.endAt = function(optPriority,optName){};
	this.setWithPriority = function(value,priority,optOnComplete){};
	this.setPriority = function(priority,optOnComplete){};

	//probably not going to do these
	this.auth = function(authToken,optOnComplete,optOnCancel){};
	this.unauth = function(){};
}

function FirePathParser()
{
	this.parse = function(path)
	{
		var regex = /^(https:\/\/|http:\/\/)[^\/]+|[^\/]+\[[^\]]+[^\/]+|[^\/]+|(?:\/\/)[^\/]+/g;
		var sections = new Array();
		var matched = null;
		while (matched = regex.exec(path)) 
		{
			var toPush = matched[0];
			if(toPush.indexOf('//') == 0)
			{
				toPush = toPush.replace(/^\/\//,'/');
			}
			var section = new FirePathSection(toPush);
			sections.push(section);
		}
		return sections;
	}
}

function FirePathSection(unparsedSection)
{
	this.unparsedSection = unparsedSection;

	if(unparsedSection.indexOf("[") !== -1)
	{
		var regex = /[^\[\]]+/g;
		var parts = new Array();
		var matched = null;
		while (matched = regex.exec(unparsedSection)) 
		{
			parts.push(matched[0]);
		}

		this.name = parts[0];
		this.rule = new FirePathSectionRule(parts[1]);
	}
	else
	{
		this.name = unparsedSection;
		this.rule = null;
	}
}

function FirePathSectionRule(unparsedRule)
{
	//evaluate rules with this order
	//functions,+,-,*,div,=,!=,<,<=,>,>=,or,and,mod

	var ruleString = unparsedRule;
	this.elementType = [];
	this.elementValue = [];

	var regex = /\(.+\)|[=<>]+| and | or |'\w+'|"\w+"|-?[a-zA-Z][a-zA-Z0-9\/]*|[0-9]+/g;
	var matched = null;
	while (matched = regex.exec(unparsedRule)) 
	{
		if(/^\(.+\)$/.test(matched[0]))
		{
			var stringToPush = matched[0].replace('(','');
			stringToPush = stringToPush.replace(')','');
			this.elementType.push(FirePathSectionRuleType.rulePart);
			this.elementValue.push(new FirePathSectionRule(stringToPush));
		}
		else if(/^[=<>!]+$/.test(matched[0]))
		{
			this.elementType.push(FirePathSectionRuleType.operator);
			this.elementValue.push(matched[0]);
		}
		else if(/^ and | or +$/.test(matched[0]))
		{
			this.elementType.push(FirePathSectionRuleType.conjunction);
			this.elementValue.push(matched[0].replace(/\s/g,''));
		}
		else if(/^'\w+'|"\w+"$/.test(matched[0]))
		{
			this.elementType.push(FirePathSectionRuleType.string);
			this.elementValue.push(matched[0].replace(/['"]/g,''));
		}
		else if(/^[a-zA-Z][a-zA-Z0-9\/]+$/.test(matched[0]))
		{
			this.elementType.push(FirePathSectionRuleType.path);
			this.elementValue.push(matched[0]);
		}
		else if(/^[0-9]+$/.test(matched[0]))
		{
			this.elementType.push(FirePathSectionRuleType.number);
			this.elementValue.push(matched[0]);
		}
		else
		{
			if(DEBUG === true)
			{
				alert("ERROR: unknown parse error in rule!")
			}
		}

		//parts.push(matched[0]);
	}

	this.toString = function(){
		return ruleString;
	};
}