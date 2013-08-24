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

	//Arrange Sections////////////////////////////////////

	function ArrangeSection (parentSection, pathSectionsRemaining, ruleToEnforce)
	{
		if(parentSection == null)
		{
			var sectionToArrange = new ArrangedFirePathSection(pathSectionsRemaining[0]);

			var newPathSectionsRemaining = pathSectionsRemaining.slice(1);
			
			ArrangeSection(sectionToArrange,,null);
		}

	}

	ArrangeSection(null, pathSections, null)

	//////////////////////////////////////////////////////

	this.getCurrentPaths = function(){
		return fireBasePaths;
	};

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

function ArrangedFirePathSection(firepathSection)
{
	this.name = firepathSection.name;
	this.unparsedSection = firepathSection.unparsedSection;
	this.rule = firepathSection.rule;

	this.subSections = new Array();
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