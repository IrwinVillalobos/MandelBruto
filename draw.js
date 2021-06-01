// Código en javascript

console.log("La vida es dura, pero es mas dura la verdura.");
var MandelCanvas = document.getElementById("MandelPicture");
var MandelLienzo = MandelCanvas.getContext("2d");
//var loadBarCanvas = document.getElementById("LoadBar");
//var loadBarLienzo = loadBarCanvas.getContext("2d");

/*loadBarLienzo.fillStyle = "black";
loadBarLienzo.fillRect(0, 0, loadBarCanvas.width, loadBarCanvas.height);
var borderThikness = 2;
emptyLoadBar();*/

var Wdth = MandelCanvas.width;
var Hgth = MandelCanvas.height;

function emptyLoadBar(){
	loadBarLienzo.fillStyle = "white";
	loadBarLienzo.fillRect(
		borderThikness, 
		borderThikness, 
		loadBarCanvas.width-2*borderThikness, 
		loadBarCanvas.height-2*borderThikness);
}

function fillLoadBar(p){
	loadBarLienzo.fillStyle = "rgb(0,255,0)";
	loadBarLienzo.fillRect(
		borderThikness, 
		borderThikness, 
		parseInt(p*(loadBarCanvas.width-2*borderThikness)/100), 
		loadBarCanvas.height-2*borderThikness);
	loadBarLienzo.stroke();
}

document.getElementById("DrawButton").addEventListener("click", drawMandelSet);
document.getElementById("mapTypeBoxLineal").addEventListener("change", changeBoxesDifferentToLineal);
document.getElementById("mapTypeBoxExponential").addEventListener("change", changeBoxesDifferentToExponential);
document.getElementById("1to1Box").addEventListener("change", changeBoxesDifferentTo1to1);
document.getElementById("4to1Box").addEventListener("change", changeBoxesDifferentTo4to1);
document.getElementById("crossBox").addEventListener("change", changeBoxesDifferentToCross);
document.getElementById("plusBox").addEventListener("change", changeBoxesDifferentToPlus);
document.getElementById("pixelsDoShareBox").addEventListener("change", changeBoxesDifferentToDoShare);
document.getElementById("pixelsDontShareBox").addEventListener("change", changeBoxesDifferentToDontShare);

function paintPixel(x, y, color){
	MandelLienzo.fillStyle = color;
	MandelLienzo.fillRect(x, y, 1, 1);
}

var centerRe = -1.2;
var centerIm = 0;
var zoomH = 2.4;

document.getElementById("ZoomBox").value = zoomH;
document.getElementById("ReCenterBox").value = centerRe;
document.getElementById("ImCenterBox").value = centerIm;

function MapToComplexPoint(h, w){
	return math.complex(zoomH*(w/Hgth - 0.5)+centerRe, zoomH*(h/Hgth - 0.5)+centerIm);	
}

var maxIter = 12;

function iterationsToGetOutOfMandelSet(C){

	var Z = math.complex(0, 0);
	var cont = 0;
	
	while(cont < maxIter){
		if(Z.re*Z.re + Z.im*Z.im < 4.0){
			Z = math.add(math.multiply(Z, Z), C);
			cont++;
		}
		else
			return cont;
	}
	
	return cont;
}

var closerDarker = false;
var mapType = 1;
var lambda = 0.1;
var MAP_TYPE_LINEAL = 0;      // -> Lineal
var MAP_TYPE_EXPONENTIAL = 1; // -> Exponencial

function mapIterationsToPrimaryColor(x, c){
	if(mapType == MAP_TYPE_LINEAL){
		if(closerDarker)
			return parseInt(((c-255)*x)/(maxIter-2) + (255*(maxIter-1)-c)/(maxIter-2));
		else
			return parseInt(((255-c)*x)/(maxIter-2) + (c*(maxIter-1)-255)/(maxIter-2));
	}
	else if(mapType == MAP_TYPE_EXPONENTIAL){
		if(!closerDarker){
			var a = (255 - c)/(Math.exp(-lambda*maxIter) - 1.0);
			var b = c - a;
			return parseInt(a*Math.exp(-lambda*x)+b);
		}
		else{
			var a = (c - 255)/(Math.exp(-lambda*maxIter) - 1.0);
			var b = 255 - a;
			return parseInt(a*Math.exp(-lambda*x)+b);
		}
	}
}

var rBackBase, gBackBase, bBackBase;
var rSet, gSet, bSet;
var SetColor;

var pointsPerPixel = 4;
var pointsConfiguration = 0; 
var pixelsShareInformation = true;

var POINTS_CONFIGURATION_CROSS = 0; // -> Configuración en tacha.
var POINTS_CONFIGURATION_PLUS = 1;  // -> Configuración en cruz.

var crossStep       = [ [1, 1],  [1, -1],  [-1,  1],  [-1, -1] ];
var plusStep        = [ [0, 1],  [1,  0],  [0,  -1],  [-1,  0] ];
var crossMatrixStep = [ [0, 0],  [0,  1],  [1,   0],  [1,   1] ];
var plusMatrixStep  = [ [0, 0],  [0,  1],  [0,   2],  [1,   1] ];

var delta = 1;
var iterMatrix = new Array(Hgth+1);

function assignPixelColor(w, h){
	var rPix = 0;
	var gPix = 0;
	var bPix = 0;
	
	for(var i=0; i<pointsPerPixel; i++){
		
		var iterations = -1;
		if(pixelsShareInformation){
			if(pointsConfiguration == POINTS_CONFIGURATION_CROSS)
				iterations = iterMatrix[h+crossMatrixStep[i][0]][w+crossMatrixStep[i][1]];
			else if(pointsConfiguration == POINTS_CONFIGURATION_PLUS)
				iterations = iterMatrix[h+plusMatrixStep[i][0]][w+plusMatrixStep[i][1]];
		}
		if(iterations == -1){
			var point;
			if(pointsConfiguration == POINTS_CONFIGURATION_CROSS)
				point = MapToComplexPoint(h+delta*crossStep[i][0], w+delta*crossStep[i][1]);
			else
				point = MapToComplexPoint(h+delta*plusStep[i][0], w+delta*plusStep[i][1]);				
			iterations = iterationsToGetOutOfMandelSet(point);
		}

		if(iterations == maxIter){
			rPix += rSet;
			gPix += gSet;
			bPix += bSet;
		}
		else{
			rPix += mapIterationsToPrimaryColor(iterations, rBackBase);
			gPix += mapIterationsToPrimaryColor(iterations, gBackBase);
			bPix += mapIterationsToPrimaryColor(iterations, bBackBase);				
		}
	}
	rPix /= pointsPerPixel; rPix = parseInt(rPix);
	gPix /= pointsPerPixel; gPix = parseInt(gPix);
	bPix /= pointsPerPixel; bPix = parseInt(bPix);
	var pixColor = "rgb(" + rPix + "," + gPix + "," + bPix + ")";
	paintPixel(w, h, pixColor);
}

function drawMandelSet(){

	var startExecution = new Date();

	document.getElementById("DrawButton").value = "Recalcular Fractal";

	//emptyLoadBar();

	zoomH = parseFloat(document.getElementById("ZoomBox").value);
	centerRe = parseFloat(document.getElementById("ReCenterBox").value);
	centerIm = parseFloat(document.getElementById("ImCenterBox").value);

	maxIter = parseInt(document.getElementById("IteracionesBox").value);
	
	var backColor = document.getElementById("BackColorBox");
	rBackBase = parseInt("0x" + backColor.value.substring(1, 3));
	gBackBase = parseInt("0x" + backColor.value.substring(3, 5));
	bBackBase = parseInt("0x" + backColor.value.substring(5, 7));	

	var setColor = document.getElementById("SetColorBox");
	rSet = parseInt("0x" + setColor.value.substring(1, 3));
	gSet = parseInt("0x" + setColor.value.substring(3, 5));
	bSet = parseInt("0x" + setColor.value.substring(5, 7));
	
	closerDarker = document.getElementById("closerDarkerCheckBox").checked;
	
	if(document.getElementById("mapTypeBoxLineal").checked)
		mapType = 0;
	else if(document.getElementById("mapTypeBoxExponential").checked)
		mapType = 1;

	if(document.getElementById("pixelsDoShareBox").checked)
		pixelsShareInformation = true;
	else if(document.getElementById("pixelsDontShareBox").checked)
		pixelsShareInformation = false;

	if(document.getElementById("1to1Box").checked)
		pointsPerPixel = 1;
	else if(document.getElementById("4to1Box").checked)
		pointsPerPixel = 4;

	if(document.getElementById("crossBox").checked)
		pointsConfiguration = POINTS_CONFIGURATION_CROSS;
	else if(document.getElementById("plusBox").checked)
		pointsConfiguration = POINTS_CONFIGURATION_PLUS;

	if(pointsPerPixel == 1)
		delta = 0;
	else if(pointsPerPixel == 4){
		if(pixelsShareInformation)
			delta = 0.5*(zoomH/Hgth);
		else
			delta = 0.25*(zoomH/Hgth);
	}

	if(pixelsShareInformation){
		if(pointsConfiguration == POINTS_CONFIGURATION_CROSS){
			for(var i=0; i<=Hgth; i++){
				iterMatrix[i] = new Array(Wdth+1);
				for(var j=0; j<=Wdth; j++)
					iterMatrix[i][j] = -1;
			}
		}
		else if(pointsConfiguration == POINTS_CONFIGURATION_PLUS){
			for(var i=0; i<=Hgth; i++){
				iterMatrix[i] = new Array(2*Wdth+2);
				for(var j=0; j<=2*Wdth+1; j++)
					iterMatrix[i][j] = -1;
			}
		}	
	}

	for(var w=0; w<Wdth; w++){
		if(((w+1)*10)%Wdth == 0){
			//fillLoadBar(parseInt((w+1)*100/Wdth));
			console.log("Avance: " + parseInt((w+1)*100/Wdth) + "%")
		}
		for(var h=0; h<Hgth; h++){
			assignPixelColor(w, h); 
		}
	}

	var endExecution = new Date();

	console.log("Fractal recien salido del horno.");
	console.log("Tiempo de ejecución: "+ (endExecution.getTime() - startExecution.getTime())/1000 + " segundos");
}

function changeBoxesDifferentToLineal(){
	if(document.getElementById("mapTypeBoxLineal").checked == 1)
		document.getElementById("mapTypeBoxExponential").checked = 0;
	else
		document.getElementById("mapTypeBoxExponential").checked = 1;
}

function changeBoxesDifferentToExponential(){
	if(document.getElementById("mapTypeBoxExponential").checked == 1)
		document.getElementById("mapTypeBoxLineal").checked = 0;
	else
		document.getElementById("mapTypeBoxLineal").checked = 1;
}

function changeBoxesDifferentTo1to1(){
	if(document.getElementById("1to1Box").checked == 1){
		document.getElementById("4to1Box").checked = 0;
		document.getElementById("plusBox").checked = 0;
		document.getElementById("plusBox").disabled = 1;
		document.getElementById("crossBox").checked = 0;
		document.getElementById("crossBox").disabled = 1;
		document.getElementById("pixelsDoShareBox").checked = 0;
		document.getElementById("pixelsDoShareBox").disabled = 1;
		document.getElementById("pixelsDontShareBox").checked = 0;
		document.getElementById("pixelsDontShareBox").disabled = 1;
	}
	else{
		document.getElementById("4to1Box").checked = 1;
		document.getElementById("plusBox").checked = 0;
		document.getElementById("plusBox").disabled = 0;
		document.getElementById("crossBox").checked = 1;
		document.getElementById("crossBox").disabled = 0;
		document.getElementById("pixelsDoShareBox").checked = 1;
		document.getElementById("pixelsDoShareBox").disabled = 0;
		document.getElementById("pixelsDontShareBox").checked = 0;
		document.getElementById("pixelsDontShareBox").disabled = 0;
	}
}

function changeBoxesDifferentTo4to1(){
	if(document.getElementById("4to1Box").checked == 1){
		document.getElementById("1to1Box").checked = 0;
		document.getElementById("4to1Box").checked = 1;
		document.getElementById("plusBox").checked = 0;
		document.getElementById("plusBox").disabled = 0;
		document.getElementById("crossBox").checked = 1;
		document.getElementById("crossBox").disabled = 0;
		document.getElementById("pixelsDoShareBox").checked = 1;
		document.getElementById("pixelsDoShareBox").disabled = 0;
		document.getElementById("pixelsDontShareBox").checked = 0;
		document.getElementById("pixelsDontShareBox").disabled = 0;
	}
	else{
		document.getElementById("1to1Box").checked = 1;
		document.getElementById("plusBox").checked = 0;
		document.getElementById("plusBox").disabled = 1;
		document.getElementById("crossBox").checked = 0;
		document.getElementById("crossBox").disabled = 1;
		document.getElementById("pixelsDoShareBox").checked = 0;
		document.getElementById("pixelsDoShareBox").disabled = 1;
		document.getElementById("pixelsDontShareBox").checked = 0;
		document.getElementById("pixelsDontShareBox").disabled = 1;
	}
}

function changeBoxesDifferentToCross(){
	if(document.getElementById("crossBox").checked == 1)
		document.getElementById("plusBox").checked = 0;
	else
		document.getElementById("plusBox").checked = 1;
}

function changeBoxesDifferentToPlus(){
	if(document.getElementById("plusBox").checked == 1)
		document.getElementById("crossBox").checked = 0;
	else
		document.getElementById("crossBox").checked = 1;
}

function changeBoxesDifferentToDoShare(){
	if(document.getElementById("pixelsDoShareBox").checked == 1)
		document.getElementById("pixelsDontShareBox").checked = 0;
	else
		document.getElementById("pixelsDontShareBox").checked = 1;
}

function changeBoxesDifferentToDontShare(){
	if(document.getElementById("pixelsDontShareBox").checked == 1)
		document.getElementById("pixelsDoShareBox").checked = 0;
	else
		document.getElementById("pixelsDoShareBox").checked = 1;
}