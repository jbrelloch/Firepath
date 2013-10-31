function Firepath(e,t){function o(e,t,n){var i=[];var s=0;for(var o=0;o<e.length;o++){var f=new Firebase(e[o]);!function(l){f.once("value",function(o){var f=u(r[t].rule,o);if(f!=null?f:false){i.push(e[l])}s++;if(s==e.length){t++;a(i,t,n)}})}(o)}}function u(e,t){var n=e.elementType.slice(0);var r=e.elementValue.slice(0);var i=false;for(var s=0;s<4;s++){var o=true;var a=0;while(o){if(s==0&&n[a]==FirepathSectionRuleType.rulePart){try{r[a]=u(r[a],t);n[a]=FirepathSectionRuleType.processed}catch(f){i=true}}else if(s==1&&n[a]==FirepathSectionRuleType.path){try{r[a]=t.child(r[a]).val();n[a]=FirepathSectionRuleType.string}catch(f){i=true}}else if(s==2&&n[a]==FirepathSectionRuleType.operator){try{var l=null;if(r[a]=="="){l=r[a-1]==r[a+1]}else if(r[a]=="<="){l=r[a-1]<=r[a+1]}else if(r[a]==">="){l=r[a-1]>=r[a+1]}else if(r[a]=="!="){l=r[a-1]!=r[a+1]}r.splice(a-1,3,l);n.splice(a-1,3,FirepathSectionRuleType.processed);a--}catch(f){i=true}}else if(s==3&&n[a]==FirepathSectionRuleType.conjunction){try{var l=null;if(n[a-1]==FirepathSectionRuleType.processed&&n[a+1]==FirepathSectionRuleType.processed){if(r[a]=="and"){l=r[a-1]&&r[a+1]}else if(r[a]=="or"){l=r[a-1]||r[a+1]}r.splice(a-1,3,l);n.splice(a-1,3,FirepathSectionRuleType.processed);a--}else{if(DEBUG){alert("error in rule")}}}catch(f){i=true}}a++;if(a>r.length){o=false}}}if(r.length>1||i){return null}else{return r[0]}}function a(e,t,n){var i=[];if(t>=r.length){s=[];for(var u=0;u<e.length;u++){var f=new Firebase(e[u]);s.push(f)}return n()}if(t==0){i.push(r[t].name);t++;a(i,t,n)}else if(/^\/.+/.test(r[t].name)){if(/^\/\*$/.test(r[t].name)){var l=0;for(var u=0;u<e.length;u++){var c=new Firebase(e[u]);!function(u){c.once("value",function(s){var u=true;var f=[s];var c=[];while(u){u=false;for(var h=0;h<f.length;h++){f[h].forEach(function(e){c.push(e);i.push(e.ref().toString())})}if(c.length>0){u=true}f=c;c=[]}l++;if(l==e.length){if(r[t].rule!=null){o(i,t,n)}else{t++;a(i,t,n)}}})}(u)}}else{var l=0;for(var u=0;u<e.length;u++){var c=new Firebase(e[u]);!function(u){c.once("value",function(s){var u=true;var f=[s];var c=[];while(u){u=false;for(var h=0;h<f.length;h++){f[h].forEach(function(e){c.push(e);if(e.name()==r[t].name.slice(1)){i.push(e.ref().toString())}})}if(c.length>0){u=true}f=c;c=[]}l++;if(l==e.length){if(r[t].rule!=null){o(i,t,n)}else{t++;a(i,t,n)}}})}(u)}}}else if(/^\*$/.test(r[t].name)){var l=0;for(var u=0;u<e.length;u++){var c=new Firebase(e[u]);!function(u){c.once("value",function(s){s.forEach(function(t){i.push(e[u]+"/"+t.name())});l++;if(l==e.length){if(r[t].rule!=null){o(i,t,n)}else{t++;a(i,t,n)}}})}(u)}}else{var l=0;for(var u=0;u<e.length;u++){var c=new Firebase(e[u]);!function(u){c.once("value",function(s){if(s.hasChild(r[t].name)){i.push(s.child(r[t].name).ref().toString())}l++;if(l==e.length){if(r[t].rule!=null){o(i,t,n)}else{t++;a(i,t,n)}}})}(u)}}}if(t!=null)DEBUG=t;var n=new FirepathParser;var r=n.parse(e);var i=e;var s=[];this.getCurrentPaths=function(){return s};if(DEBUG){var f=0;while(f<r.length){if(r[f].rule!==null){document.writeln("name= ("+r[f].name+") rule= ("+r[f].rule.toString()+")");l(r[f].rule,1)}else{document.writeln("name= ("+r[f].name+") rule= (null)")}f++}document.write("<br>");function l(e,t){var n=0;while(n<e.elementValue.length){if(e.elementType[n]==FirepathSectionRuleType.rulePart){var r="type= ("+e.elementType[n]+") value= ("+e.elementValue[n].toString()+")";for(var i=0;i<t;i++){r="    "+r}document.writeln(r);l(e.elementValue[n],t+1)}else{var r="type= ("+e.elementType[n]+") value= ("+e.elementValue[n]+")";for(var i=0;i<t;i++){r="    "+r}document.writeln(r)}n++}}}this.child=function(e){if(e.indexOf("//")==0){var t=i.replace(/\/+$/,"");var n=t+e;return new Firepath(n)}else if(e.indexOf("/")==0){var t=i.replace(/\/+$/,"");var n=t+e;return new Firepath(n)}else{var t=i.replace(/\/+$/,"");var n=t+"/"+e;return new Firepath(n)}};this.parent=function(){if(r.length===1){return null}else{var e="";for(var t=0;t<r.length-1;t++){e=e+r[t].name;if(r[t].rule===null){e=e+"/"}else{e=e+"["+r[t].rule+"]/"}}return new Firepath(e)}};this.root=function(){return new Firepath(r[0].name)};this.name=function(){return r[r.length-1].name};this.toString=function(){return i};this.set=function(e,t){a([],0,function(){var n=0;var r=[];if(s.length>0){for(var i=0;i<s.length;i++){s[i].set(e,function(e){r.push(e);n++;if(n==s.length){if(t!=null){return t(r)}}})}}else{}})};this.update=function(e,t){a([],0,function(){var n=0;var r=[];if(s.length>0){for(var i=0;i<s.length;i++){s[i].update(e,function(e){r.push(e);n++;if(n==s.length){if(t!=null){return t(r)}}})}}else{}})};this.remove=function(e){a([],0,function(){var t=0;var n=[];if(s.length>0){for(var r=0;r<s.length;r++){s[r].remove(function(r){n.push(r);t++;if(t==s.length){if(e!=null){return e(n)}}})}}else{if(DEBUG)alert("No paths found!")}})};this.push=function(e,t){a([],0,function(){var n=0;var r=[];if(s.length>0){for(var i=0;i<s.length;i++){s[i].push(e,function(e){r.push(e);n++;if(n==s.length){if(t!=null){return t(r)}}})}}else{alert("No paths found!")}})};this.on=function(e,t,n,r){a([],0,function(){var i=0;var o=[];if(s.length>0){for(var u=0;u<s.length;u++){switch(e){case"value":case"child_removed":if(n!=null&&r!=null){s[u].on(e,function(e){t(e)},function(){n()},r)}else if(n!=null){s[u].on(e,function(e){t(e)},function(){n()})}else if(r!=null){s[u].on(e,function(e){t(e)},r)}else{s[u].on(e,function(e){t(e)})}break;case"child_added":case"child_changed":case"child_moved":if(n!=null&&r!=null){s[u].on(e,function(e,n){t(e,n)},function(){n()},r)}else if(n!=null){s[u].on(e,function(e,n){t(e,n)},function(){n()})}else if(r!=null){s[u].on(e,function(e,n){t(e,n)},r)}else{s[u].on(e,function(e,n){t(e,n)})}break}}}else{alert("No paths found!")}})};this.off=function(e,t,n){a([],0,function(){var r=0;var i=[];if(s.length>0){for(var o=0;o<s.length;o++){switch(e){case"value":case"child_removed":if(t!=null&&n!=null){s[o].off(e,function(e){t(e)},n)}else if(t!=null){s[o].off(e,function(e){t(e)})}else if(n!=null){s[o].off(e,n)}else{s[o].off(e)}break;case"child_added":case"child_changed":case"child_moved":if(t!=null&&n!=null){s[o].off(e,function(e){t(e)},n)}else if(t!=null){s[o].off(e,function(e){t(e)})}else if(n!=null){s[o].off(e,n)}else{s[o].off(e)}break;default:s[o].off()}}}else{alert("No paths found!")}})};this.once=function(e,t,n,r){a([],0,function(){var i=0;var o=[];if(s.length>0){for(var u=0;u<s.length;u++){switch(e){case"value":case"child_removed":if(n!=null&&r!=null){s[u].once(e,function(e){t(e)},function(){n()},r)}else if(n!=null){s[u].once(e,function(e){t(e)},function(){n()})}else if(r!=null){s[u].once(e,function(e){t(e)},r)}else{s[u].once(e,function(e){t(e)})}break;case"child_added":case"child_changed":case"child_moved":if(n!=null&&r!=null){s[u].once(e,function(e,n){t(dataSnapshot)},function(){n()},r)}else if(n!=null){s[u].once(e,function(e,n){t(dataSnapshot)},function(){n()})}else if(r!=null){s[u].once(e,function(e,n){t(dataSnapshot)},r)}else{s[u].once(e,function(e,n){t(dataSnapshot)})}break}}}else{alert("No paths found!")}})};this.transaction=function(e,t,n){};this.limit=function(e){};this.startAt=function(e,t){};this.endAt=function(e,t){};this.setWithPriority=function(e,t,n){};this.setPriority=function(e,t){};this.auth=function(e,t,n){};this.unauth=function(){}}function FirepathParser(){this.parse=function(e){var t=/^(https:\/\/|http:\/\/)[^\/]+|[^\/]+\[[^\]]+[^\/]+|[^\/]+|(?:\/\/)[^\/]+/g;var n=new Array;var r=null;while(r=t.exec(e)){var i=r[0];if(i.indexOf("//")==0){i=i.replace(/^\/\//,"/")}var s=new FirepathSection(i);n.push(s)}return n}}function FirepathSection(e){this.unparsedSection=e;if(e.indexOf("[")!==-1){var t=/[^\[\]]+/g;var n=new Array;var r=null;while(r=t.exec(e)){n.push(r[0])}this.name=n[0];this.rule=new FirepathSectionRule(n[1])}else{this.name=e;this.rule=null}}function FirepathSectionRule(e){var t=e;this.elementType=[];this.elementValue=[];var n=/\(.+\)|[=<>]+| and | or |'\w+'|"\w+"|-?[a-zA-Z][a-zA-Z0-9\/]*|[0-9]+/g;var r=null;while(r=n.exec(e)){if(/^\(.+\)$/.test(r[0])){var i=r[0].replace("(","");i=i.replace(")","");this.elementType.push(FirepathSectionRuleType.rulePart);this.elementValue.push(new FirepathSectionRule(i))}else if(/^[=<>!]+$/.test(r[0])){this.elementType.push(FirepathSectionRuleType.operator);this.elementValue.push(r[0])}else if(/^ and | or +$/.test(r[0])){this.elementType.push(FirepathSectionRuleType.conjunction);this.elementValue.push(r[0].replace(/\s/g,""))}else if(/^'\w+'|"\w+"$/.test(r[0])){this.elementType.push(FirepathSectionRuleType.string);this.elementValue.push(r[0].replace(/['"]/g,""))}else if(/^[a-zA-Z][a-zA-Z0-9\/]+$/.test(r[0])){this.elementType.push(FirepathSectionRuleType.path);this.elementValue.push(r[0])}else if(/^[0-9]+$/.test(r[0])){this.elementType.push(FirepathSectionRuleType.number);this.elementValue.push(r[0])}else{if(DEBUG===true){alert("ERROR: unknown parse error in rule!")}}}this.toString=function(){return t}}var DEBUG=false;var FirepathSectionRuleType={path:0,string:1,number:2,operator:3,conjunction:4,rulePart:5,processed:6}