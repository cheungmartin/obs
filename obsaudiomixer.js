
/*								*/
/*								*/
/*								*/
/*								*/
/*								*/
/*								*/
/*								*/
/*		Audio panel VERSION		*/
/*								*/
/*								*/
/*								*/
/*								*/
/*								*/
/*								*/
/*		Modified by Martin		*/
var sliderExpo = 2;
var srcNameToIndex = [];
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
var btn_margin = 5;
var obs_ip = $_GET('ip');
var password = $_GET('password');
if (obs_ip == null) {
    obs_ip = "localhost"
}
var obs_port = $_GET('port');
if (obs_port == null) {
    obs_port = "4455"
}
if (password == null) {
    password = ''
}
var obs_ip_port = obs_ip + ":" + obs_port;
var obs = new OBSWebSocket();
obs.connect(
	'ws://'+obs_ip_port,
	password
).then(() => {
    console.log('Success! We\'re connected & authenticated.');
	var obsversion = "";
	var obswsversion = "";
	obs.call('GetVersion').then(function(result) {
		obsversion = result.obsVersion;
		obswsversion = result.obsWebSocketVersion;
		document.getElementById("connectedto").innerHTML = "Connected to: " + obs_ip_port + " | OBS v" + obsversion + " obs-websocket v" + obswsversion + " | ";
    });
    document.getElementsByClassName("alerte")[0].style.display = "none";
    document.getElementsByClassName("alerte")[1].style.display = "none";
    document.getElementsByClassName("alerte")[2].style.display = "none";
}).then(data => {
    if ($_GET('margin') != null) {
        if (!isNaN($_GET('margin'))) {
            btn_margin = $_GET('margin')
        }
    }
    obs.call('GetSpecialInputs').then(function(result) {
        //console.log("Audio Sources :");
		//console.log(Object.entries(result));
		Object.entries(result).forEach(function(element, k){
			if(element[1] != null){
				var asrcName = element[1];
				var desktop1quotes = '"'+asrcName+'"';
				document.getElementById("audioFrame").innerHTML += "<div class='lesboutons_AUDIO' style='display:inline-block; margin:" + btn_margin + "px " + btn_margin + "px;'><div class='audioChannel'>" + asrcName + "</div><input class='boutonscene classicbutton boutonsceneaudio' id='audio_" + asrcName + "' onclick='switch_audio(this);' type='submit' name='" + asrcName + "' value='MUTE'/>" + "<div class='fader'><input id='fader_" + k + "' type='range' step='0.1' oninput='fadervalue("+desktop1quotes+", this)'></div><p class='fader_value' id='val_" + k + "'></p></div>";
				
				obs.call('GetInputVolume', {"inputName": asrcName}).then(function(result){
					document.getElementById('fader_' + k).value = calcPerc(result.inputVolumeMul);
					document.getElementById('val_' + k).innerHTML = calcDb(result.inputVolumeMul*100) + " dB";
					mutethis(document.getElementById("audio_" + result.name), result.muted);
				});
				srcNameToIndex[asrcName] = k;
				obs.call('GetInputMute', {
					"inputName": asrcName
				}).then(function(result){	//Initalize mute button status
					mutethis(document.getElementById("audio_" + asrcName), result.inputMuted);
				});
			}
		});
    });
}).catch(err => {
    console.log(err)
});

obs.on('InputVolumeChanged', data => {
	//console.log(data.inputVolumeMul*100);
	//console.log(Object.entries(data))
	document.getElementById('fader_' + srcNameToIndex[data.inputName]).value = calcPerc(data.inputVolumeMul);
	document.getElementById("val_" + srcNameToIndex[data.inputName]).innerHTML = calcDb(data.inputVolumeMul*100) + " dB";	
});
obs.on('InputMuteStateChanged', data => {
	mutethis(document.getElementById("audio_" + data.inputName), data.inputMuted);
});

obs.on('Exiting', data => {
    alert("OBS exited")
});
obs.on('error', err => {
    console.error('socket error:', err)
});



function fadervalue(elem, fader){
	obs.call('SetInputVolume', {"inputName": elem, "inputVolumeMul": Math.pow(fader.value,sliderExpo)/Math.pow(100,sliderExpo)});
}
function calcDb(perc) {	//input 0~1 (up to 26), output -inf~0dB
	/*if (fader.value == null || fader.value.length == 0) {
		return;
	}
	var perc = fader.value;*/
	//var perc = fader;
	//var db = (Math.round(10*sliderExpo*20*(Math.log(perc*0.01)/Math.log(10)))/10).toFixed(1);
	var db = (Math.round(10*sliderExpo*20*(Math.log(Math.pow(perc*0.01, 1/sliderExpo))/Math.log(10)))/10).toFixed(1);
	if(perc < 0.001)
		db = '- inf';
	return db;
}
function calcPerc(vol){	//input Volume(expo), output perc 0~100
	var perc = Math.pow(vol*Math.pow(100,sliderExpo),1/sliderExpo);
	return perc;
}

function switch_audio(nomdescene) {
	if(nomdescene.classList.contains('redbutton')){
		obs.call('SetInputMute', {'inputName': nomdescene.name, 'inputMuted': false});
	}else{
		obs.call('SetInputMute', {'inputName': nomdescene.name, 'inputMuted': true});
	}
}

function mutethis(elem, oo) {
	if(oo == true){
		elem.classList.remove("classicbutton");
		elem.classList.add("redbutton")
	}else{
		elem.classList.remove("redbutton");
		elem.classList.add("classicbutton")
	}
}
