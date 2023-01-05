// ==UserScript==
// @name         Cyan Krunker Cheat Kit
// @namespace    https://kozelkaricsi.hu/
// @version      0.2.1
// @description  Krunker cheat kit
// @author       Cyanoure
// @include      /^(https?:\/\/)?(www\.)?(.+)krunker\.io(|\/|\/\?.+)$/
// @grant        none
// @require      https://code.jquery.com/jquery-3.5.1.min.js
// @run-at document-start
// @downloadURL = https://github.com/Cyanoure/TamperMonkeyScripts/raw/main/CyanKrunkerCheatKit.user.js
// @updateURL = https://github.com/Cyanoure/TamperMonkeyScripts/raw/main/CyanKrunkerCheatKit.user.js
// ==/UserScript==
(function() {
    var THREE2 = null;
    /*$.get("https://cdnjs.cloudflare.com/ajax/libs/three.js/r124/three.min.js",function(res){
        eval(res);
        THREE2 = THREE;
        THREE = undefined;
    });*/
    $.get("https://raw.githubusercontent.com/mrdoob/three.js/670b1e9e85356d98efa4c702e93c85dd52f01e1e/build/three.min.js",function(res){ //threejs r124
        eval(res);
        window.CyanTHREE = THREE;
        THREE2 = THREE;
        THREE = undefined;
    });

    /*var o_eval = eval;
    eval = function(...args){
        if(typeof(args[0]) == "string") console.log(args[0]);
        o_eval(args);
    }*/

    //CHEATS
    //var oObjConstructor = window.Object.prototype.constructor();

    /*window.Object = class extends Object{
        constructor(){
            super(...arguments);
            if(this.constructor.name == "THREE"){
                window.THREEJS = this;
            }
        }
    }*/

    var peekHack = false;
    var sendQueue = [];
    var savedDatas = {};
    window.WebSocket = class extends WebSocket {
        constructor() {
            super(...arguments);
            this.addEventListener("message",function(e){
                //console.log("|||||-----SOCKET MSG-----|||||");
                //console.log(event.data);

            });
        }
        send(message) {
            if (peekHack) return sendQueue.push(message);

            while (sendQueue.length) {
                var data = sendQueue.shift();
                super.send.apply(this, [data]);
            }

            return super.send.apply(this, arguments);
        }
    }

    /*var sIntV = setInterval(function(){
        if(window.scene != undefined){
            var sceneClass = window.scene.constructor;
            window.scene.constructor = class extends sceneClass{
                constructor(...args){
                    super(args);
                    console.log(scene);
                }
            }
            clearInterval(sIntV);
        }
    },100);*/

    //CHARACTERINFO
    var infoInterval = setInterval(function(){
        if(window.myCharacter != undefined){
            var x = Math.round(myCharacter.position.x);
            var y = Math.round(myCharacter.position.y);
            var z = Math.round(myCharacter.position.z);
            $(".cheatBox_title").html(`X:${x} Y:${y} Z:${z} C:${characters.length}`);
        }
    },100);
    window.characters = [];
    setInterval(function(){
        if(window.camera != undefined) window.scene = window.camera.parent.parent.parent;
    },100);
    const push = Array.prototype.push;
    Array.prototype.push = function(...args) {
        if(args[0] instanceof Object/* && ["array","object"].indexOf(args[0].constructor.name.toLowerCase()) == -1*/){
            if(args[0].type != undefined){
                try{
                    if(args[0].isCamera){
                        //console.log(args[0]);
                        window.camera = args[0];
                        /*var sceneFinderInterval = setInterval(function(){
                            function findScene(obj){
                                if(obj.isScene){
                                    window.scene = obj;
                                    clearInterval(sceneFinderInterval);
                                }else if(obj.parent != undefined){
                                    findScene(obj.parent);
                                }
                            }
                            findScene(args[0].parent);
                        },1000);*/
                    }
                }catch(err){

                }
            }
            /*if(args[0].visible != undefined){
                if(args[0].material != undefined && args[0].material != undefined){
                    if(!args[0].cyanChecked){
                        if(window.scene == undefined && args[0].parent != undefined && args[0].parent.type == "Scene"){
                            window.scene = args[0].parent;
                        }
                        args[0].cyanChecked = true;
                    }
                }
            }*/
        }
        push.apply(this, args);
    }

    //--CHARACTERINFO

    window.cameraHelper = null;
    setInterval(function(){
        if(typeof(scene) != "undefined" && scene != null){
            if(cameraHelper == null && typeof(CyanTHREE) != "undefined"){
                cameraHelper = new CyanTHREE.Group();
                cameraHelper.eulerOrder = "YXZ";
            }else if(cameraHelper != null && scene.getObjectById(cameraHelper.id) == undefined){
                scene.add(cameraHelper);
            }
        }
    },100);

    window.getCameraRotation = function(){
        return new CyanTHREE.Vector3(camera.parent.rotation.x,camera.parent.parent.rotation.y,0);
    }

    window.setCameraRotation = function(x,y){
        camera.parent.rotation.x = x;
        camera.parent.parent.rotation.y = y;
    }

    window.targetCharacter = null;
    var aiming = false;
    window.aimBot = false;

    var aimBotInterval = setInterval(function(){
        if(aimBot && aiming){
            lookAtTarget();
        }
    });

    var aimBotCheckerInterval = setInterval(function(){
        if(aimBot && typeof(camera) != "undefined" && camera != null && typeof(scene) != "undefined" && scene != null && typeof(characters) != "undefined" && typeof(CyanTHREE) != "undefined"){
            if(characters.length > 0){
                var raycaster = new CyanTHREE.Raycaster();
                //var raycasterVirtualMouse = new CyanTHREE.Vector2();
                /*raycasterVirtualMouse.x = 1;
                raycasterVirtualMouse.y = 1;*/
                /*raycaster.setFromCamera(camera.parent.parent.position,camera);
                var intersects = raycaster.intersectObjects(scene.children);
                var i = 0;
                var found = false;
                while(!found && i < intersects.length){
                    var j = 0;
                    var obj = intersects[i];
                    while(!found && j < characters.length){
                        var ch = characters[j];
                        found = ch.getObjectById(obj.id) != undefined;
                        targetCharacter = ch;
                        j++;
                    }
                    i++;
                }*/
                var pos = camera.parent.parent.position;

                function calcDistance(pos1,pos2){
                    var dX = pos1.x - pos2.x;
                    var dY = pos1.y - pos2.y;
                    var dZ = pos1.z - pos2.z;
                    return Math.sqrt(dX*dX+dY*dY+dZ*dZ);
                }
                var nearestCharacter = null;
                var nearestDistance = null;

                characters.forEach(function(item,i){
                    var distance = calcDistance(item.position,pos);
                    if((nearestCharacter == null || distance < nearestDistance) && item.visible){
                        nearestDistance = distance;
                        nearestCharacter = item;
                    }
                });
                targetCharacter = nearestCharacter;
            }
        }
    },100);

    window.lookAtTarget = function(){
        //console.log("Cél játékos becélzása.");
        if(targetCharacter != undefined && targetCharacter != null && characters.indexOf(targetCharacter) > -1){
            lookAt(targetCharacter.position.x,targetCharacter.position.y+9,targetCharacter.position.z);
        }
    }

    window.lookAt = function(x,y,z){
        if(typeof(camera) != "undefined" && camera != null && typeof(cameraHelper) != "undefined"){
            var camPos = camera.parent.parent.position;
            cameraHelper.position.x = camPos.x;
            cameraHelper.position.y = camPos.y;
            cameraHelper.position.z = camPos.z;
            cameraHelper.lookAt(x,y,z);
            setCameraRotation(-cameraHelper.rotation.x,cameraHelper.rotation.y+Math.PI);
        }
    }

    window.gameCanvas = null;
    var canvasFinderInterval = setInterval(function(){
        if($("canvas").length == 5){
            gameCanvas = $("canvas")[4];
            clearInterval(canvasFinderInterval);

            $(gameCanvas).on("mousedown",function(e){
                if(e.button == 2){
                    aiming = true;
                }
            });
            $(gameCanvas).on("mouseup",function(e){
                if(e.button == 2){
                    aiming = false;
                }
            });
        }
    },100);

    window.charintv = setInterval(function(){
        var characters2 = [];
        if(typeof(scene) != "undefined" && scene != null){
            scene.traverse(obj => {
                if(obj.type == "Object3D" && obj.children.length == 2 && obj.visible){
                    //if(obj.parent.name != "Main" && (obj.parent.parent.position.x != 0 || obj.parent.parent.position.z != 0)){
                    try{
                        function addC(cObj){
                            if(characters2.indexOf(cObj) == -1){
                                characters2.push(cObj);
                            }
                        }
                        if(obj.parent.name != "Main"){
                            if(obj.parent.parent.position.x != 0 || obj.parent.parent.position.z != 0){
                               addC(obj.parent.parent);
                            }else if(obj.parent.parent.parent.parent.position.x != 0 || obj.parent.parent.parent.parent.position.z != 0){
                                addC(obj.parent.parent.parent.parent);
                            }
                        }
                    }catch(err){}
                }
            });
        }
        characters = characters2;
    },100);

    var PlayerESPIsOn = false;
    var helpers = [];
    function setHelperNumber(n){
        while(helpers.length > n){
            scene.remove(helpers[0]);
            helpers.splice(0,1);
        }
        while(helpers.length < n){
            var hGeo = new CyanTHREE.BoxGeometry(5,11,5);
            var hMat = new CyanTHREE.MeshBasicMaterial({color:0x00ff00});
            hMat.transparent = true;
            hMat.opacity = 0.5;
            //hMat.alphaTest = 1;
            hMat.depthTest = false;
            var hObj = new CyanTHREE.Mesh(hGeo,hMat);
            scene.add(hObj);
            helpers.push(hObj);
        }
    }
    var ESPInterval = setInterval(function(){
        if(PlayerESPIsOn){
            if(typeof(characters) != "undefined"){
                setHelperNumber(characters.length);
                characters.forEach((item,i) => {
                    if(aimBot && item == targetCharacter){
                        helpers[i].material = new CyanTHREE.MeshBasicMaterial({color:0xff0000,transparent:true,opacity:0.5,depthTest:false});
                    }else{
                        helpers[i].material = new CyanTHREE.MeshBasicMaterial({color:0x00ff00,transparent:true,opacity:0.5,depthTest:false});
                    }
                    helpers[i].position.x = item.position.x;
                    helpers[i].position.y = item.position.y+11/2;
                    helpers[i].position.z = item.position.z;
                });
            }
        }else{
            if(aimBot && targetCharacter != null && characters.indexOf(targetCharacter) > -1){
                setHelperNumber(1);
                helpers[0].material = new CyanTHREE.MeshBasicMaterial({color:0xff0000,transparent:true,opacity:0.5,depthTest:false});
                helpers[0].position.x = targetCharacter.position.x;
                helpers[0].position.y = targetCharacter.position.y+11/2;
                helpers[0].position.z = targetCharacter.position.z;
            }else{
                setHelperNumber(0);
            }
        }
    });
    //--PLAYERESP

    //CÉLKERESZT
    window.addEventListener('load', function() {
        try {
            var d = document.createElement('div');
            d.style.cssText = 'display:none;width:4px;height:4px;background-color:#FF0000;position:absolute;margin:auto;top:0;right:0;bottom:0;left:0;z-index:200;border-radius:4px';
            $(d).addClass("celkereszt");
            document.body.appendChild(d);
        } catch (e) {}
    });
    function celkeresztON(){
        $(".celkereszt").show();
    }
    function celkeresztOFF(){
        $(".celkereszt").hide();
    }
    //--CÉLKERESZT

    //CHEATS END
    //-------------------------------------------------------
    function addStyle(){
        var css =
`<style>
.cheatBox{
position:fixed;
top:100px;
right:10px;
/*width:300px;
height:400px;*/
background-color:#0009;
z-index:15;
border:1px solid #000;
border-radius:15px;
overflow:auto;
}
.cheatBox_switch{
height:30px;
width:calc(100% - 20px);
/*background-color:red;*/
margin:10px 10px;
cursor:pointer;
}
.cheatBox_switch_button{
display:inline-block;
float:left;
width:30px;
height:30px;
background-color:#fff9;
border:5px solid #fff;
box-sizing:border-box;
border-radius:5px;
transition-duration:0.2s;
}
.cheatBox_switch.active .cheatBox_switch_button{
border:5px solid #5dfd;
background-color:#5df8;
}
.cheatBox_switch:hover .cheatBox_switch_button{
border:5px solid #8ef;
}
.cheatBox_switch_text{
display:inline-block;
line-height:30px;
float:left;
font-size:20px;
color:white;
margin:0 5px;
transition-duration:0.2s;
}
.cheatBox_switch.active .cheatBox_switch_text{
color:#5df;
}
.cheatBox_title{
color:white;
font-size:20px;
text-align:center;
margin:10px 20px;
}
</style>`;
        $("head").append($(css));
    }
    function addGUI(){
        var guiObj = $("<div>");
        //guiObj.css({position:"fixed",top:100,right:10,width:"300px",height:"400px","background-color":"#0009","z-index":15,border:"1px solid #000","border-radius":"15px"});
        guiObj.addClass("cheatBox");
        $("body").append(guiObj);
        guiObj.append("<div class='cheatBox_title'>Cyan Krunker Cheat Kit</div>");

        guiObj.append(createSwitch(false,"Peek [F]",function(active){
            peekHack = active;
        },70));
        guiObj.append(createSwitch(false,"Célkereszt [G]",function(active){
            if(active){
                celkeresztON();
            }else{
                celkeresztOFF();
            }
        },71));
        guiObj.append(createSwitch(false,"Player ESP [C]",function(active){
            PlayerESPIsOn = active;
        },67));
        guiObj.append(createSwitch(false,"AimBot [B]",function(active){
            aimBot = active;
        },66));
    }
    function createSwitch(defaultState = false,text = "",onSwitch = function(){},keyCode=null){
        var state = defaultState;
        var obj = $("<div>");
        //obj.css({height:"30px",width:"calc(100% - 20px)","background-color":"red","margin":"10px 10px",cursor:"pointer"});
        obj.addClass("cheatBox_switch");
        var button = $("<div>");
        //button.css({display:"inline-block",float:"left",width:"30px",height:"30px","background-color":"#0009",border:"5px solid #000f","box-sizing":"border-box","border-radius":"5px"});
        button.addClass("cheatBox_switch_button");
        obj.append(button);
        var textObj = $("<div>"+text+"</div>");
        //textObj.css({display:"inline-block","line-height":"30px",float:"left","font-size":"20px",color:"white","font-family":"sans-serif","margin":"0 5px"});
        textObj.addClass("cheatBox_switch_text");
        obj.append(textObj);
        function setState(_state = false){
            if(_state && !obj.hasClass("active")){
                obj.addClass("active");
            }else if(obj.hasClass("active")){
                obj.removeClass("active");
            }
            state = _state;
        }
        setState(defaultState);
        function switchState(){
            setState(!state);
            if(state){
                onSwitch(state);
            }else{
                onSwitch(state);
            }
        }
        $(obj).click(function(){
            switchState();
        });
        if(keyCode != null){
            $(document).on("keydown",function(e){
                if(e.keyCode == keyCode){
                    $(obj).click();
                }
            });
        }
        return obj;
    }
    window.onload = function(){
        addGUI();
        addStyle();
    }
})();
