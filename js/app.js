var app=(function() {
    'use strict';
    var that=this;

    //Parte pública
    return {
        dom:{},
        variables:{},
        setVariables:function(initVar) {
            //Variables por defecto
            this.variables.constraintVideo={'video':{ facingMode: { exact: "environment" } },'audio':false};
            this.variables.Interval=100;
            this.variables.UsingJSQR=true;
            //Seteo de variables

        },
        getReferences:function() {
            //that.dom.btnCapturar=$('#btnCapturar');
            this.dom.VisorVideo=$('#VisorVideo').get(0);
            this.dom.VisorVideo.jq=$('#VisorVideo');
            this.dom.Lienzo=$('#qr-canvas').get(0);
            this.dom.Lienzo.jq=$('#qr-canvas');
            this.dom.TBoxResultado=$('#TextBIDI').get(0);
            this.dom.TBoxResultado.jq=$('#TextBIDI');
            this.dom.LineaLog=$('#LineaLog').get(0);
            this.dom.LineaLog.jq=$('#LineaLog');
        },
        setEvents:function() {
            //Obtener imagen de la camara
            var that=this;
            this.initMediaEvents();
            this.dom.TBoxResultado.jq.on('change',$.proxy(app.onDetectaDatoQR,this));
        },
        writeLog(texto) {
            this.dom.LineaLog.jq.html('<br/>'+texto);
        },
        init:function(initVar) {
            this.setVariables(initVar);
            this.getReferences();
            this.setEvents();
        },
        initCanvas:function(ancho,alto) {
            this.dom.Lienzo.style.width=ancho+"px";
            this.dom.Lienzo.style.height=alto+"px";
            this.dom.Lienzo.width=ancho;
            this.dom.Lienzo.height=alto;
            this.dom.Lienzo.Ctx2D=this.dom.Lienzo.getContext("2d");
            this.dom.Lienzo.Ctx2D.clearRect(0,0,ancho,alto);
        },
        initMediaEvents:function() {
            this.getUserMedia(app.variables.constraintVideo, function(stream) {
                debugger;
                app.initCanvas(app.dom.VisorVideo.width>0?app.dom.VisorVideo.width:240,app.dom.VisorVideo.height>0?app.dom.VisorVideo.height:180);
                if('srcObject' in app.dom.VisorVideo) {
                    app.dom.VisorVideo.srcObject=stream;
                    try {
                    app.dom.VisorVideo.src=(window.URL || window.webkitURL).createObjectURL(stream);
                    } catch (e) {
                        console.log(e);
                    }
                } else if(navigator.mozGetUserMedia) {
                    app.dom.VisorVideo.mozSrcObject=stream;
                }
                app.CaptureToCanvas();
            },
            function (err) {
                app.writeLog(err);
            });
        },
        getUserMedia:function(options, success, fail) {
            var api=navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia|| navigator.msGetUserMedia;
            if(api) {
                return api.bind(navigator)(options,success,fail);
            } else {
                fail({message:"No se ha podido cargar el objeto navegador"});
                return null;
            }
        },
        CaptureToCanvas:function() {
            try {
                app.dom.Lienzo.Ctx2D.drawImage(app.dom.VisorVideo,0,0,app.dom.VisorVideo.width>0?app.dom.VisorVideo.width:240,app.dom.VisorVideo.height>0?app.dom.VisorVideo.height:180);
                if(!app.variables.UsingJSQR) {
                    try {
                        qrcode.onGetResult=app.GetQrResults;
                        qrcode.callback=app.GetQrResults;
                        qrcode.decode();
                    } catch(e) {
                        app.writeLog(e);
                    }
                } else {
                    try {
                        var imageData=app.dom.Lienzo.Ctx2D.getImageData(0, 0,app.dom.VisorVideo.width>0?app.dom.VisorVideo.width:240,app.dom.VisorVideo.height>0?app.dom.VisorVideo.height:180);
                        var code=jsQR(imageData.data,imageData.width,imageData.height,{
                            inversionAttempts: "dontInvert"
                        });
                        if(code) {
                            app.GetQrResults(code.data);
                        }
                    } catch (e) {
                        app.writeLog(e);
                    }
                }
            } catch(e) {
                app.writeLog(e);
            }
            setTimeout(app.CaptureToCanvas,app.variables.Interval);
        },
        GetQrResults:function(decodeResult) {
            app.dom.TBoxResultado.value=decodeResult;
            app.writeLog("Encontrado QR: "+decodeResult);
        },
        onDetectaDatoQR:function(event) {
            //Aqui es donde se dispara lo que tenga que hacer al encontrar un QR valido
            if(app.dom.TBoxResultado.value!="") {
                alert("Llamamos al controlador con "+app.dom.TBoxResultado.value)
            }
        }
    };
})();

$(document).ready(function() {
    app.init({});
});