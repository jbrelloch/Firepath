function Firepath(e,t){function o(){var e=true;var t=[s];var n=[];var r=[];while(e){for(var i=0;i<t.length;i++){var o=t[i];for(var u=0;u<o.subSections.length;u++){currentSubNode=o.subSections[u];if(currentSubNode.terminus){r.push(currentSubNode.path)}else if(currentSubNode.terminusBelow&&currentSubNode.rule!=null&&currentSubNode.ruleStatus){n.push(currentSubNode)}}}if(n.length==0){e=false}else{t=n}}return r}if(t!=null)DEBUG=t;var n=new FirepathParser;var r=n.parse(e);var i=e;var s=new ArrangedFirepathSection(null,r[0],r[0].name,r.slice(1));s.ArrangeSection();this.wait=function(e,t,n){if(s.terminusBelow){t()}else{var r=setInterval(function(){if(s.terminusBelow){clearInterval(r);t()}},1e3);var i=setTimeout(function(){clearInterval(r);if(n!=null){n()}},e)}};this.child=function(e){if(e.indexOf("//")==0){var t=i.replace(/\/+$/,"");var n=t+e;return new Firepath(n)}else if(e.indexOf("/")==0){var t=i.replace(/\/+$/,"");var n=t+e;return new Firepath(n)}else{var t=i.replace(/\/+$/,"");var n=t+"/"+e;return new Firepath(n)}};this.parent=function(){if(r.length===1){return null}else{var e="";for(var t=0;t<r.length-1;t++){e=e+r[t].name;if(r[t].rule===null){e=e+"/"}else{e=e+"["+r[t].rule+"]/"}}return new Firepath(e)}};this.root=function(){return new Firepath(r[0].name)};this.name=function(){return r[r.length-1].name};this.toString=function(){return i};this.set=function(e,t){var n=o();if(n.length>0){var r=0;var i=[];for(var s=0;s<n.length;s++){n[s].set(e,function(e){i.push(e);r++;if(r==n.length){if(t!=null){return t(i)}}})}}};this.update=function(e,t){var n=o();if(n.length>0){var r=0;var i=[];for(var s=0;s<n.length;s++){n[s].update(e,function(e){i.push(e);r++;if(r==n.length){if(t!=null){return t(i)}}})}}};this.remove=function(e){if(fireBasePaths.length>0){var t=0;var n=[];for(var r=0;r<fireBasePaths.length;r++){fireBasePaths[r].remove(function(r){n.push(r);t++;if(t==fireBasePaths.length){if(e!=null){return e(n)}}})}}};this.push=function(e,t){if(fireBasePaths.length>0){var n=0;var r=[];for(var i=0;i<fireBasePaths.length;i++){fireBasePaths[i].push(e,function(e){r.push(e);n++;if(n==fireBasePaths.length){if(t!=null){return t(r)}}})}}};this.on=function(e,t,n,r){if(fireBasePaths.length>0){var i=0;var s=[];for(var o=0;o<fireBasePaths.length;o++){switch(e){case"value":case"child_removed":if(n!=null&&r!=null){fireBasePaths[o].on(e,function(e){t(e)},function(){n()},r)}else if(n!=null){fireBasePaths[o].on(e,function(e){t(e)},function(){n()})}else if(r!=null){fireBasePaths[o].on(e,function(e){t(e)},r)}else{fireBasePaths[o].on(e,function(e){t(e)})}break;case"child_added":case"child_changed":case"child_moved":if(n!=null&&r!=null){fireBasePaths[o].on(e,function(e,n){t(e,n)},function(){n()},r)}else if(n!=null){fireBasePaths[o].on(e,function(e,n){t(e,n)},function(){n()})}else if(r!=null){fireBasePaths[o].on(e,function(e,n){t(e,n)},r)}else{fireBasePaths[o].on(e,function(e,n){t(e,n)})}break}}}};this.off=function(e,t,n){if(fireBasePaths.length>0){var r=0;var i=[];for(var s=0;s<fireBasePaths.length;s++){switch(e){case"value":case"child_removed":if(t!=null&&n!=null){fireBasePaths[s].off(e,function(e){t(e)},n)}else if(t!=null){fireBasePaths[s].off(e,function(e){t(e)})}else if(n!=null){fireBasePaths[s].off(e,n)}else{fireBasePaths[s].off(e)}break;case"child_added":case"child_changed":case"child_moved":if(t!=null&&n!=null){fireBasePaths[s].off(e,function(e){t(e)},n)}else if(t!=null){fireBasePaths[s].off(e,function(e){t(e)})}else if(n!=null){fireBasePaths[s].off(e,n)}else{fireBasePaths[s].off(e)}break;default:fireBasePaths[s].off()}}}};this.once=function(e,t,n,r){if(fireBasePaths.length>0){var i=0;var s=[];for(var o=0;o<fireBasePaths.length;o++){switch(e){case"value":case"child_removed":if(n!=null&&r!=null){fireBasePaths[o].once(e,function(e){t(e)},function(){n()},r)}else if(n!=null){fireBasePaths[o].once(e,function(e){t(e)},function(){n()})}else if(r!=null){fireBasePaths[o].once(e,function(e){t(e)},r)}else{fireBasePaths[o].once(e,function(e){t(e)})}break;case"child_added":case"child_changed":case"child_moved":if(n!=null&&r!=null){fireBasePaths[o].once(e,function(e,n){t(dataSnapshot)},function(){n()},r)}else if(n!=null){fireBasePaths[o].once(e,function(e,n){t(dataSnapshot)},function(){n()})}else if(r!=null){fireBasePaths[o].once(e,function(e,n){t(dataSnapshot)},r)}else{fireBasePaths[o].once(e,function(e,n){t(dataSnapshot)})}break}}}};this.transaction=function(e,t,n){};this.limit=function(e){};this.startAt=function(e,t){};this.endAt=function(e,t){};this.setWithPriority=function(e,t,n){};this.setPriority=function(e,t){};this.auth=function(e,t,n){};this.unauth=function(){}}function FirepathParser(){this.parse=function(e){var t=/^(https:\/\/|http:\/\/)[^\/]+|[^\/]+\[[^\]]+[^\/]+|[^\/]+|(?:\/\/)[^\/]+/g;var n=new Array;var r=null;while(r=t.exec(e)){var i=r[0];if(i.indexOf("//")==0){i=i.replace(/^\/\//,"/")}var s=new FirepathSection(i);n.push(s)}return n}}function FirepathSection(e){this.unparsedSection=e;if(e.indexOf("[")!==-1){var t=/[^\[\]]+/g;var n=new Array;var r=null;while(r=t.exec(e)){n.push(r[0])}this.name=n[0];this.rule=new FirepathSectionRule(n[1])}else{this.name=e;this.rule=null}}function ArrangedFirepathSection(e,t,n,r){this.name=t.name;this.path=n;this.dataRef=new Firebase(this.path);this.rule=t.rule;this.ruleStatus=false;this.terminus=false;this.terminusBelow=false;this.parentSection=e;this.setTerminus=function(e){this.terminusBelow=e;if(this.parentSection!=null){this.parentSection.setTerminus(e)}};this.subSections=new Array;this.pathSectionsBelow=r;this.ArrangeSection=function(){if(this.rule!=null){!function(t){t.dataRef.on("value",function(e){var n=t.rule.testRulePart(e);if(n!=null?n:false){t.ruleStatus=true}else{t.ruleStatus=false}})}(this)}else{this.ruleStatus=true}if(this.pathSectionsBelow.length==0){this.terminus=true;if(e!=null){this.setTerminus(true)}this.terminusBelow=false}else{if(/^\/.+/.test(this.pathSectionsBelow[0].name)){!function(t){t.dataRef.on("value",function(e){t.subSections=[];var n=true;var i=[e];var s=[];while(n){n=false;for(var o=0;o<i.length;o++){i[o].forEach(function(e){s.push(e);if(/^\/\*$/.test(t.pathSectionsBelow[0].name)||t.pathSectionsBelow[0].name.slice(1)==e.name()){var n=new ArrangedFirepathSection(t,t.pathSectionsBelow[0],e.ref().toString(),r.slice(1));t.subSections.push(n);n.ArrangeSection()}})}if(s.length>0){n=true}i=s;s=[]}})}(this)}else if(/^\*$/.test(this.pathSectionsBelow[0].name)){!function(t){t.dataRef.on("child_added",function(e){var n=new ArrangedFirepathSection(t,t.pathSectionsBelow[0],e.ref().toString(),r.slice(1));t.subSections.push(n);n.ArrangeSection()})}(this);!function(t){t.dataRef.on("child_removed",function(e){var n=-1;for(var r=0;r<t.subSections.length;r++){if(t.subSections[r].path=e.ref()){n=r}}if(n!=-1){t.subSections.splice(r,1)}})}(this)}else{!function(t){t.dataRef.on("child_added",function(e){if(t.pathSectionsBelow[0].name==e.name()){var n=new ArrangedFirepathSection(t,t.pathSectionsBelow[0],e.ref().toString(),r.slice(1));t.subSections.push(n);n.ArrangeSection()}})}(this);!function(t){t.dataRef.on("child_removed",function(e){var n=-1;for(var r=0;r<t.subSections.length;r++){if(t.subSections[r].path=e.ref()){n=r}}if(n!=-1){t.subSections.splice(r,1)}})}(this)}}}}function FirepathSectionRule(e){var t=e;this.elementType=[];this.elementValue=[];var n=/\(.+\)|[=<>]+| and | or |'\w+'|"\w+"|-?[a-zA-Z][a-zA-Z0-9\/]*|[0-9]+/g;var r=null;while(r=n.exec(e)){if(/^\(.+\)$/.test(r[0])){var i=r[0].replace("(","");i=i.replace(")","");this.elementType.push(FirepathSectionRuleType.rulePart);this.elementValue.push(new FirepathSectionRule(i))}else if(/^[=<>!]+$/.test(r[0])){this.elementType.push(FirepathSectionRuleType.operator);this.elementValue.push(r[0])}else if(/^ and | or +$/.test(r[0])){this.elementType.push(FirepathSectionRuleType.conjunction);this.elementValue.push(r[0].replace(/\s/g,""))}else if(/^'\w+'|"\w+"$/.test(r[0])){this.elementType.push(FirepathSectionRuleType.string);this.elementValue.push(r[0].replace(/['"]/g,""))}else if(/^[a-zA-Z][a-zA-Z0-9\/]+$/.test(r[0])){this.elementType.push(FirepathSectionRuleType.path);this.elementValue.push(r[0])}else if(/^[0-9]+$/.test(r[0])){this.elementType.push(FirepathSectionRuleType.number);this.elementValue.push(r[0])}else{if(DEBUG===true){alert("ERROR: unknown parse error in rule!")}}}this.toString=function(){return t};this.testRulePart=function(e){var t=this.elementType.slice(0);var n=this.elementValue.slice(0);var r=false;for(var i=0;i<4;i++){var s=true;var o=0;while(s){if(i==0&&t[o]==FirepathSectionRuleType.rulePart){try{n[o]=testRulePart(n[o],e);t[o]=FirepathSectionRuleType.processed}catch(u){r=true}}else if(i==1&&t[o]==FirepathSectionRuleType.path){try{n[o]=e.child(n[o]).val();t[o]=FirepathSectionRuleType.string}catch(u){r=true}}else if(i==2&&t[o]==FirepathSectionRuleType.operator){try{var a=null;if(n[o]=="="){a=n[o-1]==n[o+1]}else if(n[o]=="<="){a=n[o-1]<=n[o+1]}else if(n[o]==">="){a=n[o-1]>=n[o+1]}else if(n[o]=="!="){a=n[o-1]!=n[o+1]}n.splice(o-1,3,a);t.splice(o-1,3,FirepathSectionRuleType.processed);o--}catch(u){r=true}}else if(i==3&&t[o]==FirepathSectionRuleType.conjunction){try{var a=null;if(t[o-1]==FirepathSectionRuleType.processed&&t[o+1]==FirepathSectionRuleType.processed){if(n[o]=="and"){a=n[o-1]&&n[o+1]}else if(n[o]=="or"){a=n[o-1]||n[o+1]}n.splice(o-1,3,a);t.splice(o-1,3,FirepathSectionRuleType.processed);o--}else{if(DEBUG){alert("error in rule")}}}catch(u){r=true}}o++;if(o>n.length){s=false}}}if(n.length>1||r){return null}else{return n[0]}}}var DEBUG=false;var FirepathSectionRuleType={path:0,string:1,number:2,operator:3,conjunction:4,rulePart:5,processed:6}