
console.log("La vida es dura, pero es mas dura la verdura.");
var MandelCanvas = document.getElementById("MandelPicture");
var MandelLienzo = MandelCanvas.getContext("2d");

var Wdth = MandelCanvas.width;
var Hgth = MandelCanvas.height;

document.getElementById("drawButton").addEventListener("click", DrawMandelSet);

function PintaPixel(x, y, color){
	MandelLienzo.fillStyle = color;
	MandelLienzo.fillRect(x, y, 1, 1);
}

var upperLeftRe = -2.4;
var upperLeftIm = -1.2;
var zoomH = 2.4;
var ColNums = 10;

function MapToComplexPoint(x, y){
	return math.complex((zoomH*y)/Hgth+upperLeftRe, (zoomH*x)/Hgth+upperLeftIm);
}

var maxIter;

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

function MapIterationsToPrimaryCorlor(x, c){
	if(closerDarker)
		return parseInt(((c-255)*x)/(maxIter-2) + (255*(maxIter-1)-c)/(maxIter-2));
	else
		return parseInt(((255-c)*x)/(maxIter-2) + (c*(maxIter-1)-255)/(maxIter-2));
}

function DrawMandelSet(){

	maxIter = parseInt(document.getElementById("iteracionesBox").value);
	var rBackBase = parseInt(document.getElementById("redBack").value);
	var gBackBase = parseInt(document.getElementById("greenBack").value);
	var bBackBase = parseInt(document.getElementById("blueBack").value);
	var rSet = parseInt(document.getElementById("redSet").value);
	var gSet = parseInt(document.getElementById("greenSet").value);
	var bSet = parseInt(document.getElementById("blueSet").value);
	closerDarker = document.getElementById("closerDarkerCheckBox").checked;

	var SetColor = "rgb(" + rSet + "," + gSet + "," + bSet + ")";

	for(var w=0; w<Wdth; w++){
		for(var h=0; h<Hgth; h++){
			var point = MapToComplexPoint(h, w);
			var iterations = iterationsToGetOutOfMandelSet(point);
			if(iterations == maxIter)
				PintaPixel(w, h, SetColor);
			else{
				var rPix = MapIterationsToPrimaryCorlor(iterations, rBackBase);
				var gPix = MapIterationsToPrimaryCorlor(iterations, gBackBase);
				var bPix = MapIterationsToPrimaryCorlor(iterations, bBackBase);				
				var pixColor = "rgb(" + rPix + "," + gPix + "," + bPix + ")";
				PintaPixel(w, h, pixColor);
			}
		}
	}
}