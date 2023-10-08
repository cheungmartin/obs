/*								*/
/*								*/
/*								*/
/*								*/
/*								*/
/*								*/
/*								*/
/*		Screenshot VERSION		*/
/*								*/
/*								*/
/*								*/
/*								*/
/*								*/
/*								*/
/*		Modified by Martin		*/
var activescene = "";
var activepreview = "";
var swSceneName = "";
var activetrans = "";
var studio_status = "unknown";
var cut_transition = "";
var trans_duration = 350;
var run_slider = !0;
var isstreaming = !1;
var isrecording = !1;
function fullscreen(elem) {
	if (elem.requestFullscreen) {
		document.documentElement.requestFullscreen()
	} else if (elem.msRequestFullscreen) {
		document.documentElement.msRequestFullscreen()
	} else if (elem.mozRequestFullScreen) {
		document.documentElement.mozRequestFullScreen()
	} else if (elem.webkitRequestFullscreen) {
		document.documentElement.webkitRequestFullscreen()
	}
}

function $_GET(param) {
	var vars = {};
	window.location.href.replace(location.hash, '').replace(/[?&]+([^=&]+)=?([^&]*)?/gi, function(m, key, value) {
		vars[key] = value !== undefined ? value : ''
	});
	if (param) {
		return vars[param] ? vars[param] : null
	}
	return vars
}
var scenes_avec_id = [];
var obs_ip = $_GET('ip');
var obs_port = $_GET('port');
var password = $_GET('password');
var scene_counter_limit = $_GET('limit');
var btn_margin = $_GET('margin');
var nosleepvar = $_GET('nosleep');
var numpad = $_GET('numpad');
var enable_aux = $_GET('aux');
var enable_src = $_GET('src');
var enable_mute = $_GET('mute');
var ss_Pgm = $_GET('ssPgm');
var ss_Pvw = $_GET('ssPvw');
var ss_FPS = $_GET('ssFPS');
var ss_size = $_GET('ssSize');
var noSleep = new NoSleep();
if (nosleepvar != null && nosleepvar == 'on') {
	noSleep.enable();
	console.log("Nosleep enabled!");
	document.getElementById("nosleep").checked = !0;
}
if (obs_ip == null) {
	obs_ip = "localhost"
}else{
	document.getElementById("ip").value = obs_ip;
}
if (obs_port == null) {
	obs_port = "4455"
}else{
	document.getElementById("port").value = obs_port;
}
if (password == null) {
	password = ''
}else{
	document.getElementById("password").value = password;
}
if (scene_counter_limit != null)
	document.getElementById("limit").value = scene_counter_limit;
if (scene_counter_limit == null || isNaN(scene_counter_limit) || scene_counter_limit == "0")
	scene_counter_limit = 1000;
if (btn_margin != null)
	document.getElementById("margin").value = btn_margin;
if (btn_margin == null || isNaN(btn_margin))
	btn_margin = 5;
if (numpad != null)
	document.getElementById("numpad").checked = !0;
if (enable_aux == null || enable_aux == !0) {
	enable_aux = !0;
	document.getElementById("aux").checked = !0;
}else{
	enable_aux = !1;
	document.getElementById("aux").checked = !1;
}
if (enable_src == null || enable_src == !0) {
	enable_src = !0;
	document.getElementById("src").checked = !0;
	document.getElementsByClassName("srcrow")[0].insertAdjacentHTML('beforebegin', '<br>');
}else{
	enable_src = !1;
	document.getElementById("src").checked = !1;
}
if (enable_mute == null | enable_mute == !0) {
	enable_mute = !0;
	document.getElementById("mute").checked = !0;
}else{
	enable_mute = !1;
	document.getElementById("mute").checked = !1;
}
if (ss_Pgm == null) {
	ss_Pgm = !1;
}else{
	ss_Pgm = !0;
	document.getElementById("ssPgm").checked = !0;
}
if (ss_Pvw == null) {
	ss_Pvw = !1;
}else{
	ss_Pvw = !0;
	document.getElementById("ssPvw").checked = !0;
}
if (ss_FPS == null) {
	ss_FPS = "2"
}else{
	document.getElementById("ssFPS").value = ss_FPS;
}
if (ss_size == null) {
	ss_size = "20"
}else{
	document.getElementById("ssSize").value = ss_size;
}
document.getElementsByClassName("screenShot_Win")[0].style.height = ss_size*9 + "px";
document.getElementsByClassName("screenShot_Win")[1].style.height = ss_size*9 + "px";
var obs_ip_port = obs_ip + ":" + obs_port;
var obs = new OBSWebSocket();
var connected = false;
obs.connect(
	'ws://'+obs_ip_port,
	password
).then(() => {
    console.log('Success! We\'re connected & authenticated.');
	connected = true;
	var obsversion = "";
	var obswsversion = "";
	obs.call('GetVersion').then(function(result) {
		obsversion = result.obsVersion;
		obswsversion = result.obsWebSocketVersion;
		document.getElementById("connectedto").innerHTML = "Connected to: " + obs_ip_port + " | OBS v" + obsversion + " obs-websocket v" + obswsversion + " | ";
    });
    document.getElementById("connOverlay").style.display = "none";
	document.getElementsByClassName("alerte")[0].style.display = "none";	//still need if user never connect successfully
    document.getElementsByClassName("alerte")[1].style.display = "none";
	/*if(enable_aux != true)
		document.getElementsByClassName("auxrow")[0].style.display = "none";*/
	if(enable_src == !1){
		document.getElementsByClassName("srcrow")[0].style.display = "none";
		document.getElementsByClassName("srcrow")[1].style.display = "none";
	}
	if(enable_mute == !1){
		document.getElementById("lesbuttons_AUDIO_id").style.display = "none";
		document.getElementById("lesbuttons_AUDIO").style.display = "none";
	}
	if(ss_Pvw == !0 || ss_Pgm == !0){
		if(ss_Pvw == !0)
			initSsWindow("screenShot_PVW", "pvwImg", "Preview");
		if(ss_Pgm == !0)
			initSsWindow("screenShot_PGM", "pgmImg", "Program");
		document.getElementById("screenShot_PVW").insertAdjacentHTML('afterend', '<br>');
	}
	function initSsWindow(ssId, imgId, imgAlt){
		document.getElementById(ssId).style.display = "inline-block";
		document.getElementById(ssId).style.height = ss_size*9 + "px";
		document.getElementById(ssId).innerHTML = '<img id="' + imgId + '" alt="' + imgAlt + '" src=""/>';
	}
    return obs.call('GetSceneList');
}).then(data => {	// Initial print
    var scene_counter = 0;
	var aux_counter = 0;
	var aux2_counter = 0;
	isthereaux = !1;
	isthereaux2 = !1;
    data.scenes.forEach(scene => {
        if (scene_counter < scene_counter_limit) {
            document.getElementById("lesbuttons_PGM").innerHTML += "<input class='buttonscene classicbutton buttonscenepgm' style='margin: " + btn_margin + "px " + btn_margin + "px;' id='pgm_" + scene.sceneName + "' onclick='switch_pgm(this);' type='submit' name='" + scene.sceneName + "' value='" + scene.sceneName + "'/>";
            document.getElementById("lesbuttons_PVW").innerHTML += "<input class='buttonscene classicbutton buttonscenepvw' style='margin: " + btn_margin + "px " + btn_margin + "px;' id='pvw_" + scene.sceneName + "' onclick='switch_pvw(this);' type='submit' name='" + scene.sceneName + "' value='" + scene.sceneName + "'/>";
            scenes_avec_id.push(scene.sceneName)
        }
		//AUX using same limit
		if(scene.sceneName == 'AUX'){
			isthereaux = !0;
			drawAuxBtn(scene.sceneName, 'aux', 'AUX', aux_counter);
		}
		if(scene.sceneName == 'AUX 2'){
			isthereaux2 = !0;
			drawAuxBtn(scene.sceneName, 'aux2', 'AUX2', aux2_counter);
		}
        scene_counter++;
    });
	if(enable_aux == !0){
		if (isthereaux == !0){
			document.getElementsByClassName("auxrow")[0].style.display = "inline-block";
			document.getElementsByClassName("auxrow")[1].style.display = "inline-block";
			document.getElementById("lesbuttons_AUX").insertAdjacentHTML('afterend', '<br>');
		}
		if (isthereaux2 == !0){
			document.getElementsByClassName("aux2row")[0].style.display = "inline-block";
			document.getElementsByClassName("aux2row")[1].style.display = "inline-block";
			document.getElementById("lesbuttons_AUX2").insertAdjacentHTML('afterend', '<br>');
		}
	}
	activescene = data.currentProgramSceneName;
    if (scenes_avec_id.includes(activescene))
        colorPGM(document.getElementById("pgm_" + activescene))
	activepreview = data.currentPreviewSceneName;
	if (scenes_avec_id.includes(activepreview))
		colorPVW(document.getElementById("pvw_" + activepreview))
	
	drawSourceBtn(data.currentPreviewSceneName);
    
	obs.call('GetSceneTransitionList').then(function(result) {
        var transitions_liste = result.transitions;
        cut_transition = transitions_liste[0].transitionName;
        transitions_liste.forEach(trans => {
            var transname_quotes = '"' + trans.transitionName + '"';
            document.getElementById("lesbuttons_TRANS").innerHTML += "<input class='buttonscene classicbutton buttontrans' style='margin: " + btn_margin + "px " + btn_margin + "px;' id='trans_" + trans.transitionName + "' onclick='transit(" + transname_quotes + ");' type='submit' name='" + trans.transitionName + "' value='" + trans.transitionName + "'/>"
        });
        var currenttransition = result.currentSceneTransitionName;
        activetrans = "trans_" + currenttransition;
        colorTRANS(document.getElementById(activetrans))
    });
	
    getCurrentTransition();
	
    obs.call('GetStudioModeEnabled').then(function(result) {
        if (result.studioModeEnabled == !0) {
            enablestudiomode()
        } else {
            disablestudiomode()
        }
    });
	
    obs.call('GetSpecialInputs').then(function(result) {		//AUDIO Source here
        //console.log("Audio Sources :");
		//console.log(Object.entries(result));
		Object.entries(result).forEach(function(element){
			//console.log(element[0]);
			if(element[1] != null){
				var asrcName = element[1];
				document.getElementById("lesbuttons_AUDIO").innerHTML += "<div style='display:inline-block; width:100px; text-align:center; margin:" + btn_margin + "px " + btn_margin + "px;'><div class='audioChannel'>" + asrcName + "</div><input class='buttonscene classicbutton buttonsceneaudio' id='audio_" + asrcName + "' onclick='switch_audio(this);' type='submit' name='" + asrcName + "' value='MUTE'/>" + "</div>";
				obs.call('GetInputMute', {
					"inputName": asrcName
				}).then(function(result){	//Initalize mute button status
					colorMUTE(document.getElementById("audio_" + asrcName), result.inputMuted);
				});
			}
		});
    })
}).catch(err => {
    console.log(err)
});

// * * Event Listeners * * //
obs.on('CurrentProgramSceneChanged', data => {
    colorPGM(document.getElementById("pgm_" + data.sceneName));
    activescene = data.sceneName;
	if(studio_status == "disabled")
		drawSourceBtn(activescene);
});
obs.on('CurrentPreviewSceneChanged', data => {
	colorPVW(document.getElementById("pvw_" + data.sceneName));
	activepreview = data.sceneName;
	drawSourceBtn(activepreview);
});

obs.on('CurrentSceneTransitionChanged', data => {
    colorTRANS(document.getElementById("trans_" + data.transitionName));
	if (data.transitionName == cut_transition) {
		;
	}else{
		getCurrentTransition();
	}
});

obs.on('SceneItemEnableStateChanged', data => {
	// sources on/off in preview
	if(data.sceneName == activepreview || (data.sceneName == activescene && studio_status == "disabled"))
		colorSRC(document.getElementById("src_" + data.sceneItemId), data.sceneItemEnabled);
	// sources on/off in AUX
	if(data.sceneName == 'AUX')
		colorAUX(document.getElementById("aux_" + data.sceneItemId), data.sceneItemEnabled);
	if(data.sceneName == 'AUX 2')
		colorAUX(document.getElementById("aux2_" + data.sceneItemId), data.sceneItemEnabled);
});

obs.on('InputMuteStateChanged', data => {
	colorMUTE(document.getElementById("audio_" + data.inputName), data.inputMuted);
});
obs.on('CurrentSceneTransitionDurationChanged', data => {
    trans_duration = data.transitionDuration;
    document.getElementById('transition_input').value = trans_duration
});
obs.on('StudioModeStateChanged', data => {
	if(data.studioModeEnabled == !0)
		enablestudiomode();
	else
		disablestudiomode();
});
/*
obs.on('Exiting', data => {
	alert("OBS exited")
});*/
obs.on('CurrentSceneCollectionChanged', data => {
	window.location.reload()
});
obs.on('StreamStateChanged', data => {
	isstreaming = data.outputActive;
	showstreamstatus()
});
obs.on('RecordStateChanged', data => {
	isrecording = data.outputActive;
	showstreamstatus()
});
obs.on('error', err => {
	console.error('socket error:', err)
});

function disablestudiomode() {
    studio_status = "disabled";
    document.getElementsByClassName("pvwrow")[0].style.display = "none";
	document.getElementsByClassName("pvwrow")[1].style.display = "none";
	document.getElementById("screenShot_PVW").style.display = "none";
    document.getElementById("studio_status").innerHTML = "Studio mode: " + studio_status + " | ";
	obs.call('GetCurrentProgramScene').then(function(result) {
		activescene = result.currentProgramSceneName;
		drawSourceBtn(activescene);
    });
}

function enablestudiomode() {
    studio_status = "enabled";
    document.getElementsByClassName("pvwrow")[0].style.display = "inline-block";
	document.getElementsByClassName("pvwrow")[1].style.display = "inline-block";
    document.getElementById("studio_status").innerHTML = "Studio mode: " + studio_status + " | ";
	obs.call('GetCurrentPreviewScene').then(function(result) {
        activepreview = result.currentPreviewSceneName	;
        if (scenes_avec_id.includes(activepreview)) {
            colorPVW(document.getElementById("pvw_" + activepreview))
        }
    });
	if(ss_Pvw == !0)
		document.getElementById("screenShot_PVW").style.display = "inline-block";
}

function showstreamstatus() {
	if (isstreaming && isrecording) {
		document.getElementById("strRec").innerHTML = "(<img src='images/live.gif'/> Streaming and recording)"
	} else if (isstreaming && !isrecording) {
		document.getElementById("strRec").innerHTML = "(<img src='images/live.gif'/> Streaming)"
	} else if (!isstreaming && isrecording) {
		document.getElementById("strRec").innerHTML = "(<img src='images/live.gif'/> Recording)"
	} else {
		document.getElementById("strRec").innerHTML = ""
	}
}

// NumberPad 1,2,3,4 to cut-in program view (1 corr key 97)
window.onkeyup = function(e) {
	var key = e.keyCode ? e.keyCode : e.which;
	if (numpad != null && key > 96 && key < 101)
		switch_pgm(document.getElementsByClassName("buttonscenepgm")[key-97]);
}


// * * User Action * * //
function switch_aux(nomdescene, sceneItemId) {
	if(nomdescene.classList.contains('buttonsceneaux'))
		swSceneName = 'AUX';
	else
		swSceneName = 'AUX 2';
	
	if(nomdescene.classList.contains('colorAUXbutton')){
		obs.call('SetSceneItemEnabled', {'sceneName': swSceneName, 'sceneItemId': sceneItemId, 'sceneItemEnabled': false});
	}else{
		obs.call('SetSceneItemEnabled', {'sceneName': swSceneName, 'sceneItemId': sceneItemId, 'sceneItemEnabled': true});
	}
}

function switch_pgm(nomdescene) {
	if (studio_status == "enabled")
		obs.call('SetCurrentSceneTransition', {"transitionName": cut_transition});
	else
		myMove();
	obs.call('SetCurrentProgramScene', {'sceneName': nomdescene.value});
}

function switch_pvw(nomdescene) {
	obs.call('SetCurrentPreviewScene', {'sceneName': nomdescene.value});
}

function switch_src(nomdescene, sceneItemId) {
	if(studio_status == "disabled")
		swSceneName = activescene;
	else
		swSceneName = activepreview;
	if(nomdescene.classList.contains('colorSRCbutton'))
		obs.call('SetSceneItemEnabled', {'sceneName': swSceneName, 'sceneItemId': sceneItemId, 'sceneItemEnabled': false});
	else
		obs.call('SetSceneItemEnabled', {'sceneName': swSceneName, 'sceneItemId': sceneItemId, 'sceneItemEnabled': true});
}

function switch_audio(nomdescene) {
	if(nomdescene.classList.contains('colorMUTEbutton')){
		obs.call('SetInputMute', {'inputName': nomdescene.name, 'inputMuted': false});
	}else{
		obs.call('SetInputMute', {'inputName': nomdescene.name, 'inputMuted': true});
	}
}

function transit(trans_name) {
    activepreview = activescene;
    if (studio_status == "enabled") {
		obs.call('SetCurrentSceneTransition', {"transitionName": trans_name}).then(() => {
			obs.call('TriggerStudioModeTransition').then(function(data) {
				if (trans_name == cut_transition) {
					obs.call('SetCurrentPreviewScene', {
						'sceneName': activepreview
					});
					run_slider = !1;
				} else {
					run_slider = !0;
					/*setTimeout(function() {
						obs.call('SetCurrentPreviewScene', {
							'sceneName': activepreview
						});
					}, trans_duration)*/
				}
				myMove()
			});
		});
    } else {
        obs.call('SetCurrentSceneTransition', {
            "transitionName": trans_name
        })
    }
}

function myMove() {
	var elem = document.getElementById("trans_animation_child");
    var width = 0;
    var debut = new Date().getTime();
    if (run_slider) {
        var id = setInterval(frame, 1)
    };
    var largeur = 0;

    function frame() {
        var now = new Date().getTime();
        if (now >= debut + trans_duration) {
            clearInterval(id);
            elem.style.width = "100%"
        } else {
            largeur = ((now - debut) / trans_duration) * 100;
            elem.style.width = largeur + '%'
        }
    }
}
document.getElementById("transition_input").onchange = function() {
    var trans_duration_input = parseInt(document.getElementById("transition_input").value);
    obs.call('SetCurrentSceneTransitionDuration', {
        "transitionDuration": trans_duration_input
    })
};
function getCurrentTransition(){
	obs.call('GetCurrentSceneTransition').then(function(result) {
        trans_duration = result.transitionDuration;
        document.getElementById('transition_input').value = trans_duration
    });
}


// * * User Interface * * //
// Draw Source / AUX button
function drawSourceBtn(sceneName){
	document.getElementById("lesbuttons_SRC").innerHTML = "";
	obs.call('GetSceneItemList', {sceneName: sceneName}).then(data => {
		data.sceneItems.forEach(source => {
		document.getElementById("lesbuttons_SRC").innerHTML += "<input class='buttonscene classicbutton buttonscenesrc' style='margin: " + btn_margin + "px " + btn_margin + "px;' id='src_" + source.sceneItemId + "' onclick='switch_src(this," + source.sceneItemId + ");' type='submit' name='" + source.sourceName + "' value='" + source.sourceName + "'/>";
			if(source.sceneItemEnabled == true){
				colorSRC(document.getElementById("src_" + source.sceneItemId), true);
			}
		})
	});
}

function drawAuxBtn(sceneName, prefix1, prefix2, counter){
	obs.call('GetSceneItemList', {sceneName: sceneName}).then(data => {
		data.sceneItems.forEach(source => {
			if (counter < scene_counter_limit) {
				document.getElementById("lesbuttons_" + prefix2).innerHTML += "<input class='buttonscene classicbutton buttonscene" + prefix1 + "' style='margin: " + btn_margin + "px " + btn_margin + "px;' id='" + prefix1 + "_" + source.sceneItemId + "' onclick='switch_aux(this," + source.sceneItemId + ");' type='submit' name='" + source.sourceName + "' value='" + source.sourceName + "'/>";
				if(source.sceneItemEnabled == true){
					colorAUX(document.getElementById(prefix1 + "_" + source.sceneItemId), true);
				}
				counter++;
			}
		})
	});
}

function colorAUX(elem, oo) {
	if(oo == !0){
		elem.classList.remove("classicbutton");
		elem.classList.add("colorAUXbutton")
	}else{
		elem.classList.remove("colorAUXbutton");
		elem.classList.add("classicbutton")
	}
}
function colorPGM(elem) {
	var buttonsscenepgm = document.getElementsByClassName("buttonscenepgm");
	for (var i = 0; i < buttonsscenepgm.length; i++) {
		buttonsscenepgm[i].classList.add("classicbutton")
	}
	elem.classList.remove("classicbutton");
	elem.classList.add("colorPGMbutton")
}
function colorPVW(elem) {
	var buttonsscenepvw = document.getElementsByClassName("buttonscenepvw");
	for (var i = 0; i < buttonsscenepvw.length; i++) {
		buttonsscenepvw[i].classList.add("classicbutton")
	}
	elem.classList.remove("classicbutton");
	elem.classList.add("colorPVWbutton");
}
function colorSRC(elem, oo) {
	if(oo == !0){
		elem.classList.remove("classicbutton");
		elem.classList.add("colorSRCbutton")
	}else{
		elem.classList.remove("colorSRCbutton");
		elem.classList.add("classicbutton")
	}
}
function colorTRANS(elem) {
	var buttonsscenetrans = document.getElementsByClassName("buttontrans");
	for (var i = 0; i < buttonsscenetrans.length; i++) {
		buttonsscenetrans[i].classList.add("classicbutton")
	}
	elem.classList.remove("classicbutton");
	elem.classList.add("colorTRANSbutton")
}
function colorMUTE(elem, oo) {
	if(oo == !0){
		elem.classList.remove("classicbutton");
		elem.classList.add("colorMUTEbutton")
	}else{
		elem.classList.remove("colorMUTEbutton");
		elem.classList.add("classicbutton")
	}
}


// * * Call Connect page Overlay * * //
function connPage() {
	document.getElementById("connOverlay").style.display = "block";
}
function exitOverlay() {
	if (connected == !0)
		document.getElementById("connOverlay").style.display = "none";
}


// * * Render Pgm/Pvw Screenshot * * //
function preInter() {
	if(ss_Pvw == !0){
		setInterval(function(){ ssView(activepreview,'pvwImg'); }, 1000/ss_FPS);
	}
	if(ss_Pgm == !0)
		setInterval(function(){ ssView(activescene,'pgmImg'); }, 1000/ss_FPS);
}
function ssView(srcName,eleId) {
	obs.call('GetSourceScreenshot',{
		sourceName: srcName,
		imageFormat: "png",
		imageWidth: ss_size*16, imageHeight: ss_size*9,
		imageCompressionQuality: 50
	}).then(function(data) {
		document.getElementById(eleId).src = data.imageData;
	});
}


// * * Coloring button * * //
var btncolorlist = [
	['url(images/blank_blue_button.png)', '0px 0px 30px rgb(0,0,255)'],
	['url(images/blank_purple_button.png)', '0px 0px 30px rgb(130,80,250)'],
	['url(images/blank_magenta_button.png)', '0px 0px 30px rgb(255,0,255)'],
	['url(images/blank_cyan_button.png)', '0px 0px 30px rgb(0,200,255)'],
	['url(images/blank_red_button.png)', '0px 0px 30px rgb(255,0,0)'],
	['url(images/blank_yellow_button.png)', '0px 0px 30px rgb(255,255,0)'],
	['url(images/blank_green_button.png)', '0px 0px 30px rgb(0,255,0)']
];
function btnRules(btn){		// rule 456789 in stylesheet
	switch(btn){
		case 'auxbtn': return 4; break;
		case 'pgmbtn': return 5; break;
		case 'pvwbtn': return 6; break;
		case 'srcbtn': return 7; break;
		case 'trnbtn': return 8; break;
		case 'mutbtn': return 9; break;
	}
}

// this list is default color for: aux, pgm, pvw, src, trn, mut
var listBtncolor = [3,4,6,0,5,4]
function changecolor(btn){
	rulesNum = btnRules(btn);
	btncolor = ++listBtncolor[rulesNum-4];
	listHue[rulesNum-4] = 0; //reset Hue rotate
	var styleee = document.styleSheets[0].cssRules[rulesNum].style; //Style sheet sequence related
	styleee.backgroundImage = btncolorlist[btncolor%7][0];
	styleee.boxShadow = btncolorlist[btncolor%7][1];
	styleee.filter = 'hue-rotate(0deg)';
}

// this list is default hue for: aux, pgm, pvw, src, trn, mut
var listHue = [0, 0, 0, 0, 0, 0]
var myInterval;
var btn;
function down(locbtn){
	myInterval = setInterval(changehue, 50);
	btn = locbtn;
}
function up(){
	clearInterval(myInterval);
}
function changehue(){
	rulesNum = btnRules(btn);
	hue = ++listHue[rulesNum-4]*5;
	var styleee = document.styleSheets[0].cssRules[rulesNum].style;
	styleee.filter = 'hue-rotate('+hue+'deg)';
}