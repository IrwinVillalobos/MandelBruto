
console.log("La vida es dura, pero es mas dura la verdura.");
var MandelCanvas = document.getElementById("MandelPicture");
var MandelLienzo = MandelCanvas.getContext("2d");

var Wdth = MandelCanvas.width;
var Hgth = MandelCanvas.height;

document.getElementById("drawButton").addEventListener("click", drawMandelSet);
document.getElementById("mapTypeBoxLineal").addEventListener("change", changeBoxesDifferentToLineal);
document.getElementById("mapTypeBoxExponential").addEventListener("change", changeBoxesDifferentToExponential);

function paintPixel(x, y, color){
	MandelLienzo.fillStyle = color;
	MandelLienzo.fillRect(x, y, 1, 1);
}

var centerRe = -1.2;
var centerIm = 0;
var zoomH = 2.4;
var ColNums = 10;

function MapToComplexPoint(x, y){
	return math.complex(zoomH*(y/Hgth - 0.5)+centerRe, zoomH*(x/Hgth - 0.5)+centerIm);	
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
// mapType = 0 -> Lineal
// mapType = 1 -> Exponencial

function mapIterationsToPrimaryColor(x, c){
	if(mapType == 0){
		if(closerDarker)
			return parseInt(((c-255)*x)/(maxIter-2) + (255*(maxIter-1)-c)/(maxIter-2));
		else
			return parseInt(((255-c)*x)/(maxIter-2) + (c*(maxIter-1)-255)/(maxIter-2));
	}
	else if(mapType == 1){
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

function drawMandelSet(){

	maxIter = parseInt(document.getElementById("iteracionesBox").value);
	var rBackBase = parseInt(document.getElementById("redBack").value);
	var gBackBase = parseInt(document.getElementById("greenBack").value);
	var bBackBase = parseInt(document.getElementById("blueBack").value);
	var rSet = parseInt(document.getElementById("redSet").value);
	var gSet = parseInt(document.getElementById("greenSet").value);
	var bSet = parseInt(document.getElementById("blueSet").value);
	closerDarker = document.getElementById("closerDarkerCheckBox").checked;
	if(document.getElementById("mapTypeBoxLineal").checked){
		mapType = 0;
	}
	else if(document.getElementById("mapTypeBoxExponential").checked){
		mapType = 1;
	}

	var SetColor = "rgb(" + rSet + "," + gSet + "," + bSet + ")";

	for(var w=0; w<Wdth; w++){
		for(var h=0; h<Hgth; h++){
			var point = MapToComplexPoint(h, w);
			var iterations = iterationsToGetOutOfMandelSet(point);
			if(iterations == maxIter)
				paintPixel(w, h, SetColor);
			else{
				var rPix = mapIterationsToPrimaryColor(iterations, rBackBase);
				var gPix = mapIterationsToPrimaryColor(iterations, gBackBase);
				var bPix = mapIterationsToPrimaryColor(iterations, bBackBase);				
				var pixColor = "rgb(" + rPix + "," + gPix + "," + bPix + ")";
				paintPixel(w, h, pixColor);
			}
		}
	}
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