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
var manual_preview = !0;
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
var disable_aux = $_GET('aux');
var disable_src = $_GET('src');
var disable_mute = $_GET('mute');
var ss_Pgm = $_GET('ssPgm');
var ss_Pvw = $_GET('ssPvw');
var ss_FPS = $_GET('ssFPS');
var ss_size = $_GET('ssSize');
var ss_size_overlay = window.innerwidth; 
var pgmSSOverlay = false;
var noSleep = new NoSleep();
if (nosleepvar != null && nosleepvar == 'on') {
	noSleep.enable();
	console.log("Nosleep enabled!");
	document.getElementById("nosleep").checked = true;
}
if (obs_ip == null) {
	obs_ip = "localhost"
}else{
	document.getElementById("ip").value = obs_ip;
}
if (obs_port == null) {
	obs_port = "4444"
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
	document.getElementById("numpad").checked = true;
if (disable_aux != null) {
	disable_aux = true;
	document.getElementById("aux").checked = true;
}
if (disable_src != null) {
	disable_src = true;
	document.getElementById("src").checked = true;
}else{
	document.getElementsByClassName("srcrow")[0].insertAdjacentHTML('beforebegin', '<br>');
}
if (disable_mute != null) {
	disable_mute = true;
	document.getElementById("mute").checked = true;
}
if (ss_Pgm != null) {
	ss_Pgm = false;
	document.getElementById("ssPgm").checked = true;
}else{
	ss_Pgm = true;
}
if (ss_Pvw != null) {
	ss_Pvw = false;
	document.getElementById("ssPvw").checked = true;
}else{
	ss_Pvw = true;
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
obs.connect({
	address: obs_ip_port,
	password: password
}).then(() => {
    console.log('Success! We\'re connected & authenticated.');
	connected = true;
	var obsversion = "";
	var obswsversion = "";
	obs.send('GetVersion').then(function(result) {
		obsversion = result.obsStudioVersion;
		obswsversion = result.obsWebsocketVersion;
		document.getElementById("connectedto").innerHTML = "Connected to: " + obs_ip_port + " | OBS v" + obsversion + " obs-websocket v" + obswsversion + " | ";
    });
    document.getElementById("connOverlay").style.display = "none";
	document.getElementsByClassName("alerte")[0].style.display = "none";	//still need if user never connect successfully
    document.getElementsByClassName("alerte")[1].style.display = "none";
	/*if(disable_aux == true)
		document.getElementsByClassName("auxrow")[0].style.display = "none";*/
	if(disable_src == true){
		document.getElementsByClassName("srcrow")[0].style.display = "none";
		document.getElementsByClassName("srcrow")[1].style.display = "none";
	}
	if(disable_mute == true){
		document.getElementById("lesboutons_AUDIO_id").style.display = "none";
		document.getElementById("lesboutons_AUDIO").style.display = "none";
	}
	if(ss_Pvw == true){
		document.getElementById("screenShot_PVW").style.display = "inline-block";
		document.getElementById("screenShot_PVW").style.height = ss_size*9 + "px";
		document.getElementById("screenShot_PVW").innerHTML = '<img id="pvwImg" alt="Preview" src=""/>';
	}
	if(ss_Pgm == true){
		document.getElementById("screenShot_PGM").style.display = "inline-block";
		document.getElementById("screenShot_PGM").style.height = ss_size*9 + "px";
		document.getElementById("screenShot_PGM").innerHTML = '<img id="pgmImg" alt="Program" src=""/ onclick="ssOverlaySet()">';
	}
	if(ss_Pvw == true || ss_Pgm == true){
		document.getElementById("screenShot_PVW").insertAdjacentHTML('afterend', '<br>');
	}
    return obs.send('GetSceneList');
}).then(data => {
    var scene_counter = 0;
	var aux_counter = 0;
	var aux2_counter = 0;
	isthereaux = false;
	isthereaux2 = false;
    data.scenes.forEach(scene => {
        if (scene.name !== data.currentScene) {}
        if (scene_counter < scene_counter_limit) {
            document.getElementById("lesboutons_PGM").innerHTML += "<input class='boutonscene classicbutton boutonscenepgm' style='margin: " + btn_margin + "px " + btn_margin + "px;' id='pgm_" + scene.name + "' onclick='switch_pgm(this);' type='submit' name='" + scene.name + "' value='" + scene.name + "'/>";
            document.getElementById("lesboutons_PVW").innerHTML += "<input class='boutonscene classicbutton boutonscenepvw' style='margin: " + btn_margin + "px " + btn_margin + "px;' id='pvw_" + scene.name + "' onclick='switch_pvw(this);' type='submit' name='" + scene.name + "' value='" + scene.name + "'/>";
            scenes_avec_id.push(scene.name)
        }
		//AUX using same limit
		if(scene.name == 'AUX'){
			isthereaux = true;
			scene.sources.forEach(source => {
				if (aux_counter < scene_counter_limit) {
					document.getElementById("lesboutons_AUX").innerHTML += "<input class='boutonscene classicbutton boutonsceneaux' style='margin: " + btn_margin + "px " + btn_margin + "px;' id='aux_" + source.name + "' onclick='switch_aux(this);' type='submit' name='" + source.name + "' value='" + source.name + "'/>";
					if(source.render == true){
						colorAUX(document.getElementById("aux_" + source.name), true);
					}
					aux_counter++;
				}
			})
		}
		if(scene.name == 'AUX 2'){
			isthereaux2 = true;
			scene.sources.forEach(source => {
				if (aux2_counter < scene_counter_limit) {
					document.getElementById("lesboutons_AUX2").innerHTML += "<input class='boutonscene classicbutton boutonsceneaux2' style='margin: " + btn_margin + "px " + btn_margin + "px;' id='aux2_" + source.name + "' onclick='switch_aux(this);' type='submit' name='" + source.name + "' value='" + source.name + "'/>";
					if(source.render == true){
						colorAUX(document.getElementById("aux2_" + source.name), true);
					}
					aux2_counter++;
				}
			})
		}
        activescene = data.currentScene;
        scene_counter++;
		if (scene.name == data.currentScene)	//In Assume no preview scene, draw the button first
			drawSourceBtn(scene);
    });
	if(disable_aux != true){
		if (isthereaux == true){
			document.getElementsByClassName("auxrow")[0].style.display = "inline-block";
			document.getElementsByClassName("auxrow")[1].style.display = "inline-block";
			document.getElementById("lesboutons_AUX").insertAdjacentHTML('afterend', '<br>');
		}
		if (isthereaux2 == true){
			document.getElementsByClassName("aux2row")[0].style.display = "inline-block";
			document.getElementsByClassName("aux2row")[1].style.display = "inline-block";
			document.getElementById("lesboutons_AUX2").insertAdjacentHTML('afterend', '<br>');
		}
	}
    if (scenes_avec_id.includes(activescene))
        colorPGM(document.getElementById("pgm_" + activescene));
    obs.send('GetPreviewScene').then(function(result) {
        activepreview = result.name;
        if (scenes_avec_id.includes(activepreview)) {
            colorPVW(document.getElementById("pvw_" + activepreview))
        }
		drawSourceBtn(result);
    });
    obs.send('GetTransitionList').then(function(result) {
        var transitions_liste = result.transitions;
        cut_transition = transitions_liste[0].name;
        transitions_liste.forEach(trans => {
            var transname_quotes = '"' + trans.name + '"';
            document.getElementById("lesboutons_TRANS").innerHTML += "<input class='boutonscene classicbutton boutontrans' style='margin: " + btn_margin + "px " + btn_margin + "px;' id='trans_" + trans.name + "' onclick='cut(" + transname_quotes + ");' type='submit' name='" + trans.name + "' value='" + trans.name + "'/>"
        });
        var currenttransition = result.currentTransition;
        activetrans = "trans_" + currenttransition;
        colorTRANS(document.getElementById(activetrans))
    });
    obs.send('GetTransitionDuration').then(function(result) {
        trans_duration = result.transitionDuration;
        document.getElementById('transition_input').value = trans_duration
    });
    obs.send('GetStudioModeStatus').then(function(result) {
        if (result.studioMode == !0) {
            enablestudiomode()
        } else {
            disablestudiomode()
        }
    });
	
    obs.send('GetSpecialSources').then(function(result) {		//AUDIO Source here
        console.log("Audio Sources :");
		console.log(Object.entries(result));
		Object.entries(result).forEach(function(element){
			//console.log(element[0]);
			if(['desktop-1', 'desktop-2', 'mic-1', 'mic-2', 'mic-3'].indexOf(element[0]) >= 0){
				desktop1 = element[1];
				document.getElementById("lesboutons_AUDIO").innerHTML += "<div style='display:inline-block; width:100px; text-align:center; margin:" + btn_margin + "px " + btn_margin + "px;'><div class='audioChannel'>" + desktop1 + "</div><input class='boutonscene classicbutton boutonsceneaudio' id='audio_" + desktop1 + "' onclick='switch_audio(this);' type='submit' name='" + desktop1 + "' value='MUTE'/>" + "</div>";
				obs.send('GetMute', {
					"source": desktop1
				}).then(function(result){	//Initalize mute button status
					colorMUTE(document.getElementById("audio_" + result.name), result.muted);
				});
			}
		});
    })
}).catch(err => {
    console.log(err)
});

obs.on('SwitchScenes', data => {
    colorPGM(document.getElementById("pgm_" + data.sceneName));
    activescene = data.sceneName;
	if(studio_status == "disabled")
		drawSourceBtn(data);
});
obs.on('PreviewSceneChanged', data => {
	colorPVW(document.getElementById("pvw_" + data.sceneName));
	activepreview = data.sceneName;
	drawSourceBtn(data);
});

obs.on('SwitchTransition', data => {
    colorTRANS(document.getElementById("trans_" + data.transitionName))
});

//new version
obs.on('SceneItemVisibilityChanged', data => {
	// sources on/off in preview
	if(data.sceneName == activepreview || (data.sceneName == activescene && studio_status == "disabled"))
		colorSRC(document.getElementById("src_" + data.itemName), data.itemVisible);
	// sources on/off in AUX
	if(data.sceneName == 'AUX')
		colorAUX(document.getElementById("aux_" + data.itemName), data.itemVisible);
	if(data.sceneName == 'AUX 2')
		colorAUX(document.getElementById("aux2_" + data.itemName), data.itemVisible);
});

obs.on('SourceMuteStateChanged', data => {
	colorMUTE(document.getElementById("audio_" + data.sourceName), data.muted);
});

obs.on('TransitionDurationChanged', data => {
    trans_duration = data.newDuration;
    document.getElementById('transition_input').value = trans_duration
});
obs.on('StudioModeSwitched', data => {
	if(data.newState == !0)
		enablestudiomode();
	else
		disablestudiomode();
});
obs.on('Exiting', data => {
	alert("OBS exited")
});
obs.on('SceneCollectionChanged', data => {
	window.location.reload()
});
obs.on('StreamStarted', data => {
	isstreaming = !0;
	showstreamstatus()
});
obs.on('StreamStopped', data => {
	isstreaming = !1;
	showstreamstatus()
});
obs.on('RecordingStarted', data => {
	isrecording = !0;
	showstreamstatus()
});
obs.on('RecordingStopped', data => {
	isrecording = !1;
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
	obs.send('GetCurrentScene').then(function(result) {
		activescene = result.name;
		drawSourceBtn(result);
    });
}

function enablestudiomode() {
    studio_status = "enabled";
    document.getElementsByClassName("pvwrow")[0].style.display = "inline-block";
	document.getElementsByClassName("pvwrow")[1].style.display = "inline-block";
    document.getElementById("studio_status").innerHTML = "Studio mode: " + studio_status + " | ";
	obs.send('GetPreviewScene').then(function(result) {
        activepreview = result.name;
        if (scenes_avec_id.includes(activepreview)) {
            colorPVW(document.getElementById("pvw_" + activepreview))
        }
    });
	if(ss_Pvw == true)
		document.getElementById("screenShot_PVW").style.display = "inline-block";
}

// NumberPad 1,2,3,4 to cut-in program view (1 corr key 97)
window.onkeyup = function(e) {
	var key = e.keyCode ? e.keyCode : e.which;
	if (numpad != null && key > 96 && key < 101)
		switch_pgm(document.getElementsByClassName("boutonscenepgm")[key-97]);
}

function switch_aux(nomdescene) {
	if(nomdescene.classList.contains('boutonsceneaux'))
		swSceneName = 'AUX';
	else
		swSceneName = 'AUX 2';
	
	if(nomdescene.classList.contains('colorAUXbutton')){
		obs.send('SetSceneItemRender', {'scene-name': swSceneName, 'source': nomdescene.value, 'render': false});
	}else{
		obs.send('SetSceneItemRender', {'scene-name': swSceneName, 'source': nomdescene.value, 'render': true});
	}
}

function switch_pgm(nomdescene) {
	if (studio_status == "enabled")
		obs.send('SetCurrentTransition', {"transition-name": cut_transition});
	else
		myMove();
	obs.send('SetCurrentScene', {'scene-name': nomdescene.value});
}

function switch_pvw(nomdescene) {
	obs.send('SetPreviewScene', {'scene-name': nomdescene.value});
}

function switch_src(nomdescene) {
	if(studio_status == "disabled")
		swSceneName = activescene;
	else
		swSceneName = activepreview;
	if(nomdescene.classList.contains('colorSRCbutton'))
		obs.send('SetSceneItemRender', {'scene-name': swSceneName, 'source': nomdescene.value, 'render': false});
	else
		obs.send('SetSceneItemRender', {'scene-name': swSceneName, 'source': nomdescene.value, 'render': true});
}

function switch_audio(nomdescene) {
	if(nomdescene.classList.contains('colorMUTEbutton')){
		obs.send('SetMute', {'source': nomdescene.name, 'mute': false});
	}else{
		obs.send('SetMute', {'source': nomdescene.name, 'mute': true});
	}
}

function cut(trans_type) {
    manual_preview = !1;
    var transition = {
        "with-transition": {
            "name": trans_type,
            "duration": trans_duration
        }
    };
    activepreview = activescene;
    if (studio_status == "enabled") {
        obs.send('TransitionToProgram', transition).then(function(data) {
			if (trans_type == cut_transition) {
            obs.send('SetPreviewScene', {
                'scene-name': activepreview
            });
            run_slider = !1;
            manual_preview = !0
			} else {
				setTimeout(function() {
					obs.send('SetPreviewScene', {
						'scene-name': activepreview
					});
					manual_preview = !0
				}, trans_duration)
			}
		});
        run_slider = !0;
        
        myMove()
    } else {
        obs.send('SetCurrentTransition', {
            "transition-name": trans_type
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
    obs.send('SetTransitionDuration', {
        "duration": trans_duration_input
    })
};

function drawSourceBtn(data){
	document.getElementById("lesboutons_SRC").innerHTML = "";
	data.sources.forEach(source => {
		document.getElementById("lesboutons_SRC").innerHTML += "<input class='boutonscene classicbutton boutonscenesrc' style='margin: " + btn_margin + "px " + btn_margin + "px;' id='src_" + source.name + "' onclick='switch_src(this);' type='submit' name='" + source.name + "' value='" + source.name + "'/>";
		if(source.render == true){
			colorSRC(document.getElementById("src_" + source.name), true);
		}
	})
}

function colorAUX(elem, oo) {
	if(oo == true){
		elem.classList.remove("classicbutton");
		elem.classList.add("colorAUXbutton")
	}else{
		elem.classList.remove("colorAUXbutton");
		elem.classList.add("classicbutton")
	}
}
function colorPGM(elem) {
	var boutonsscenepgm = document.getElementsByClassName("boutonscenepgm");
	for (var i = 0; i < boutonsscenepgm.length; i++) {
		boutonsscenepgm[i].classList.add("classicbutton")
	}
	elem.classList.remove("classicbutton");
	elem.classList.add("colorPGMbutton")
}
function colorPVW(elem) {
	var boutonsscenepvw = document.getElementsByClassName("boutonscenepvw");
	for (var i = 0; i < boutonsscenepvw.length; i++) {
		boutonsscenepvw[i].classList.add("classicbutton")
	}
	elem.classList.remove("classicbutton");
	elem.classList.add("colorPVWbutton");
}
function colorSRC(elem, oo) {
	if(oo == true){
		elem.classList.remove("classicbutton");
		elem.classList.add("colorSRCbutton")
	}else{
		elem.classList.remove("colorSRCbutton");
		elem.classList.add("classicbutton")
	}
}
function colorTRANS(elem) {
	var boutonsscenetrans = document.getElementsByClassName("boutontrans");
	for (var i = 0; i < boutonsscenetrans.length; i++) {
		boutonsscenetrans[i].classList.add("classicbutton")
	}
	elem.classList.remove("classicbutton");
	elem.classList.add("colorTRANSbutton")
}
function colorMUTE(elem, oo) {
	if(oo == true){
		elem.classList.remove("classicbutton");
		elem.classList.add("colorMUTEbutton")
	}else{
		elem.classList.remove("colorMUTEbutton");
		elem.classList.add("classicbutton")
	}
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

// * * Call Connect page Overlay * * //
function connPage() {
	document.getElementById("connOverlay").style.display = "block";
}
function exitOverlay() {
	if (connected == true)
		document.getElementById("connOverlay").style.display = "none";
	if (pgmSSOverlay == true)
		document.getElementById("screenShot_overlay").style.display = "none";
	
}

// * * Rendering Pgm/Pvw Screenshot * * //
function preInter() {
	if(ss_Pvw == true){
		setInterval(ssPvw, 1000/ss_FPS);
	}
	if(ss_Pgm == true){
		if(pgmSSOverlay = true){
			setInterval(ssOverlay, 1000/ss_FPS);
		}
		setInterval(ssPgm, 1000/ss_FPS);
	}
}
function ssOverlaySet() {
	//if(win = "pgm"){
		tmp1 = activescene;	// TODO: scene
		pgmSSOverlay = true;
		document.getElementById("screenShot_overlay").style.display = "block";
		document.getElementById("screenShot_overlay").innerHTML = '<img id="overlayImg" alt="Screen Overlay" src=""/ onclick="exitOverlay()">';
	//}
}
function ssOverlay(win) {
	obs.send('TakeSourceScreenshot',{
		sourceName: activescene,	// TODO: scene
		embedPictureFormat: "png",
		width: ss_size_overlay, height: ss_size_overlay/16*9	//ss_size*4*16, height: ss_size*4*9
	}).then(function(data) {
		document.getElementById('overlayImg').src = data.img;
	});
}
function ssPvw() {
	obs.send('TakeSourceScreenshot',{
		sourceName: activepreview,
		embedPictureFormat: "png",
		width: ss_size*16, height: ss_size*9
	}).then(function(data) {
		document.getElementById('pvwImg').src = data.img;
	});
}
function ssPgm() {
	obs.send('TakeSourceScreenshot',{
		sourceName: activescene,
		embedPictureFormat: "png",
		width: ss_size*16, height: ss_size*9
	}).then(function(data) {
		document.getElementById('pgmImg').src = data.img;
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