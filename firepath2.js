var DEBUG = false;

var FirepathSectionRuleType = { "path": 0, 
             "string": 1, 
             "number": 2,
             "operator": 3,
             "conjunction": 4,
             "rulePart": 5,
             "processed": 6 };

function Firepath(path, optDEBUG)
{
	if(optDEBUG != null)
		DEBUG = optDEBUG;

	var parser = new FirepathParser();

	var pathSections = parser.parse(path);

	var basePath = path;

	var firePathRoot = new ArrangedFirepathSection(null,pathSections[0],pathSections[0].name,pathSections.slice(1));

	firePathRoot.ArrangeSection();

	// this.getRootPath = function(){
	// 	return firePathRoot;
	// };

	function getPaths()
	{
		var notDone = true;
		var nodesToSearch = [firePathRoot];
		var newNodesToSearch = [];
		var currentPaths = [];

		while(notDone)
		{
			for(var i = 0; i<nodesToSearch.length; i++)
			{
				var currentNode = nodesToSearch[i];
				for(var j = 0; j<currentNode.subSections.length; j++)
				{
					currentSubNode = currentNode.subSections[j];
					if(currentSubNode.terminus)
					{
						currentPaths.push(currentSubNode.path);
					}
					else if(currentSubNode.terminusBelow && (currentSubNode.rule != null && currentSubNode.ruleStatus))
					{
						newNodesToSearch.push(currentSubNode);
					}
				}
			}
			if(newNodesToSearch.length == 0)
			{
				notDone = false;
			}
			else
			{
				nodesToSearch = newNodesToSearch;
			}
		}

		return currentPaths;
	}

	this.wait = function(timeout,callback,timeoutCallback) {
		if(firePathRoot.terminusBelow)
		{
			callback();
		}
		else
		{
			var timer = setInterval(function(){
				if(firePathRoot.terminusBelow)
				{
					clearInterval(timer);
					callback();
				}
			},1000);

			var timerTimeout = setTimeout(function(){
				clearInterval(timer);
				if(timeoutCallback != null)
				{
					timeoutCallback();
				}
			},timeout);
		}
	}

	this.child = function(childPath)
	{
		if(childPath.indexOf('//') == 0)//starts with '//'
		{
			var trimmedBasePath = basePath.replace(/\/+$/,'');
			var newPath = trimmedBasePath+childPath;
			return new Firepath(newPath);
		}
		else if(childPath.indexOf('/') == 0)//starts with '/'
		{
			var trimmedBasePath = basePath.replace(/\/+$/,'');
			var newPath = trimmedBasePath+childPath;
			return new Firepath(newPath);
		}
		else
		{
			var trimmedBasePath = basePath.replace(/\/+$/,'');
			var newPath = trimmedBasePath+'/'+childPath;
			return new Firepath(newPath);
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
			return new Firepath(newPath);
		}
	};
	this.root = function()
	{
		//the first element in sections is the root
		return new Firepath(pathSections[0].name); 
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
		var fireBasePaths = getPaths();

		if(fireBasePaths.length > 0)//OUTER IF SUBJECT TO CHANGE (what do we do when no path's are found?)
		{
			var finishCount = 0;
			var errors = [];
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
	};
	this.update = function(value,optOnComplete)
	{
		var fireBasePaths = getPaths();

		if(fireBasePaths.length > 0)//OUTER IF SUBJECT TO CHANGE (what do we do when no path's are found?)
		{
			var finishCount = 0;
			var errors = [];
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
	};
	this.remove = function(optOnComplete)
	{
		if(fireBasePaths.length > 0)//OUTER IF SUBJECT TO CHANGE (what do we do when no path's are found?)
		{
			var finishCount = 0;
			var errors = [];
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
	};
	//Value is supposed to be optional, but i need the callback and I 
	// dont think it will work with a callback without a value
	this.push = function(value,optOnComplete)
	{
		if(fireBasePaths.length > 0)//OUTER IF SUBJECT TO CHANGE (what do we do when no path's are found?)
		{
			var finishCount = 0;
			var errors = [];
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
	};
	this.on = function(eventType,callback,optCancelCallback,optContext)
	{
		if(fireBasePaths.length > 0)//OUTER IF SUBJECT TO CHANGE (what do we do when no path's are found?)
		{
			var finishCount = 0;
			var errors = [];
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
	};
	this.off = function(optEventType,optCallback,optContext)
	{
		if(fireBasePaths.length > 0)//OUTER IF SUBJECT TO CHANGE (what do we do when no path's are found?)
		{
			var finishCount = 0;
			var errors = [];
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
	};
	this.once = function(eventType,successCallback,optFailureCallback,optContext)
	{
		if(fireBasePaths.length > 0)//OUTER IF SUBJECT TO CHANGE (what do we do when no path's are found?)
		{
			var finishCount = 0;
			var errors = [];
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

function FirepathParser()
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
			var section = new FirepathSection(toPush);
			sections.push(section);
		}
		return sections;
	}
}

function FirepathSection(unparsedSection)
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
		this.rule = new FirepathSectionRule(parts[1]);
	}
	else
	{
		this.name = unparsedSection;
		this.rule = null;
	}
}

function ArrangedFirepathSection(parentSection,firepathSection, path, pathSectionsBelow)
{
	this.name = firepathSection.name;
	this.path = path;
	this.dataRef = new Firebase(this.path);
	this.rule = firepathSection.rule;
	this.ruleStatus = false;
	this.terminus = false;
	this.terminusBelow = false;

	this.parentSection = parentSection;

	this.setTerminus = function(terminusBool)
	{
		this.terminusBelow = terminusBool;
		if(this.parentSection != null)
		{
			this.parentSection.setTerminus(terminusBool);
		}
	};

	this.subSections = new Array();
	this.pathSectionsBelow = pathSectionsBelow;

	this.ArrangeSection = function()
	{
		//add rule listener if rule is not null
		if(this.rule != null)
		{
			!function closure0(this2){
				this2.dataRef.on('value', function(dataSnapshot){
					var testResult = this2.rule.testRulePart(dataSnapshot);

					if((testResult != null)?testResult:false)
					{
						this2.ruleStatus = true;
					}
					else
					{
						this2.ruleStatus = false;
					}
				});
			}(this);
		}
		else //set the rule status to true
		{
			this.ruleStatus = true;
		}

		if(this.pathSectionsBelow.length == 0)
		{
			this.terminus = true;
			if(parentSection != null)
			{
				this.setTerminus(true);
			}
			this.terminusBelow = false;
		}
		else
		{
			//add listeners based off the content of the next section
			if(/^\/.+/.test(this.pathSectionsBelow[0].name))
			{
				//search everywhere below this node (// operator found)
				!function closure1(this2){
					this2.dataRef.on('value', function(dataSnapshot){
						this2.subSections = [];//redo everything below this node

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
									if(/^\/\*$/.test(this2.pathSectionsBelow[0].name) || (this2.pathSectionsBelow[0].name.slice(1) == childSnapshot.name()))
									{
										//double slash operator plus a star operator OR snapshot name matches what we are looking for
										var newSection = new ArrangedFirepathSection(this2,this2.pathSectionsBelow[0],childSnapshot.ref().toString(),pathSectionsBelow.slice(1));
										this2.subSections.push(newSection);
										newSection.ArrangeSection();
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
					});
				}(this);
			}
			else if(/^\*$/.test(this.pathSectionsBelow[0].name))
			{
	            //star operator, match every node at current level
				!function closure2(this2){
		            this2.dataRef.on('child_added', function(childSnapshot){
		            	var newSection = new ArrangedFirepathSection(this2,this2.pathSectionsBelow[0],childSnapshot.ref().toString(),pathSectionsBelow.slice(1));
						this2.subSections.push(newSection);
						newSection.ArrangeSection();
					});
		        }(this);
				!function closure3(this2){
					this2.dataRef.on('child_removed', function(oldChildSnapshot){
						var indexOfSnap = -1;
						for(var j = 0; j < this2.subSections.length; j++)
						{
							if(this2.subSections[j].path = oldChildSnapshot.ref())
							{
								indexOfSnap = j;
							}
						}
						if(indexOfSnap != -1)
						{
							this2.subSections.splice(j,1);
						}
					});
				}(this);
	        }
	        else
			{
				//just a normal node
				!function closure4(this2){
					this2.dataRef.on('child_added', function(childSnapshot){
						if(this2.pathSectionsBelow[0].name == childSnapshot.name())
						{
							var newSection = new ArrangedFirepathSection(this2,this2.pathSectionsBelow[0],childSnapshot.ref().toString(),pathSectionsBelow.slice(1));
							this2.subSections.push(newSection);
							newSection.ArrangeSection();
						}
					});
				}(this);
				!function closure5(this2){
					this2.dataRef.on('child_removed', function(oldChildSnapshot){
						var indexOfSnap = -1;
						for(var j = 0; j < this2.subSections.length; j++)
						{
							if(this2.subSections[j].path = oldChildSnapshot.ref())
							{
								indexOfSnap = j;
							}
						}
						if(indexOfSnap != -1)
						{
							this2.subSections.splice(j,1);
						}
					});
				}(this);
			}
		}
	}
}

function FirepathSectionRule(unparsedRule)
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
			this.elementType.push(FirepathSectionRuleType.rulePart);
			this.elementValue.push(new FirepathSectionRule(stringToPush));
		}
		else if(/^[=<>!]+$/.test(matched[0]))
		{
			this.elementType.push(FirepathSectionRuleType.operator);
			this.elementValue.push(matched[0]);
		}
		else if(/^ and | or +$/.test(matched[0]))
		{
			this.elementType.push(FirepathSectionRuleType.conjunction);
			this.elementValue.push(matched[0].replace(/\s/g,''));
		}
		else if(/^'\w+'|"\w+"$/.test(matched[0]))
		{
			this.elementType.push(FirepathSectionRuleType.string);
			this.elementValue.push(matched[0].replace(/['"]/g,''));
		}
		else if(/^[a-zA-Z][a-zA-Z0-9\/]+$/.test(matched[0]))
		{
			this.elementType.push(FirepathSectionRuleType.path);
			this.elementValue.push(matched[0]);
		}
		else if(/^[0-9]+$/.test(matched[0]))
		{
			this.elementType.push(FirepathSectionRuleType.number);
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

	this.testRulePart = function(snapShotBase){
		//alert("processing rule: "+rule+" from ref: "+snapShotBase.ref().toString());
		var tempRuleType = this.elementType.slice(0);
		var tempRuleValue = this.elementValue.slice(0);
		var ultimateFail = false;
		//order is ruleParts,paths,operators,conjunctions
		for (var i = 0; i < 4; i++) {
			//alert("Outer loop count: "+i);
			var notDone = true;
			var pointer = 0;
			while(notDone)
			{
				//alert("Inner loop count: "+pointer+" ruleType: "+tempRuleType[pointer]+" conj rule type: "+FirepathSectionRuleType.conjunction);
				if(i==0 && tempRuleType[pointer]==FirepathSectionRuleType.rulePart)
				{
					try
					{
						tempRuleValue[pointer] = testRulePart(tempRuleValue[pointer],snapShotBase);
						tempRuleType[pointer] = FirepathSectionRuleType.processed;
					}
					catch(err)
					{
						ultimateFail = true;
					}
				}
				else if(i==1 && tempRuleType[pointer]==FirepathSectionRuleType.path)
				{
					//alert("resolving path: "+tempRuleValue[pointer]+" from ref: "+snapShotBase.ref().toString());
					try
					{
						tempRuleValue[pointer] = snapShotBase.child(tempRuleValue[pointer]).val();
						tempRuleType[pointer] = FirepathSectionRuleType.string;
					}
					catch(err)
					{
						ultimateFail = true;
					}
					//alert("path resolved: "+tempRuleValue[pointer]);
				}
				else if(i==2 && tempRuleType[pointer]==FirepathSectionRuleType.operator)
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
						tempRuleType.splice(pointer-1,3,FirepathSectionRuleType.processed);
						pointer--;
					}
					catch(err)
					{
						ultimateFail = true;
					}
					//alert("resolved operator: "+tempRuleValue[pointer]);
				}
				else if(i==3 && tempRuleType[pointer]==FirepathSectionRuleType.conjunction)
				{
					//alert("resolving conjunction: "+tempRuleValue[pointer]+" between: "+tempRuleValue[pointer-1]+" and "+tempRuleValue[pointer+1]);
					try
					{
						var tempHolder = null;
						if(tempRuleType[pointer-1] == FirepathSectionRuleType.processed
							&& tempRuleType[pointer+1] == FirepathSectionRuleType.processed)
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
							tempRuleType.splice(pointer-1,3,FirepathSectionRuleType.processed);
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
}