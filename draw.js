
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
var pointsShareInformation = true;

var POINTS_CONFIGURATION_CROSS = 0; // -> Configuración en tacha.
var POINTS_CONFIGURATION_PLUS = 1;  // -> Configuración en cruz.

/*
var PAINT_PIXEL_METHOD_1TO1 = 0;             // -> Un punto por pixel.
var PAINT_PIXEL_METHOD_4TO1_INDV_CROSS = 1;  // -> Cuatro puntos por pixel. No comparten puntos. Arreglo en cruz.
var PAINT_PIXEL_METHOD_4TO1_INDV_PLUS = 2;   // -> Cuatro puntos por pixel. No comparten puntos. Arreglo en mas.
var PAINT_PIXEL_METHOD_4TO1_SHRD_CROSS = 3;  // -> Cuatro puntos por pixel. Comparten puntos. Arreglo en cruz.
var PAINT_PIXEL_METHOD_4TO1_SHRD_PLUS = 4;   // -> Cuatro puntos por pixel. Comparten puntos. Arreglo en mas.
*/

var crossStep       = [ [1, 1],  [1, -1],  [-1,  1],  [-1, -1] ];
var plusStep        = [ [0, 1],  [1,  0],  [0,  -1],  [-1,  0] ];
var crossMatrixStep = [ [0, 0],  [0,  1],  [1,   0],  [1,   1] ];
var plusMatrixStep  = [ [0, 0],  [0,  1],  [0,   2],  [1,   1] ];

var iterMatrix = new Array(Hgth+1);

for(var i=0; i<=Hgth; i++){
	iterMatrix[i] = new Array(2*Wdth+2);
	for(var j=0; j<=2*Wdth+1; j++){
		iterMatrix[i][j] = -1;
	}
}

function assignPixelColor(w, h){
	var rPix = 0;
	var gPix = 0;
	var bPix = 0;
	var delta = 0.5*(zoomH/Hgth);
	for(var i=0; i<4; i++){
		var iterations = iterMatrix[h+crossMatrixStep[i][0]][w+crossMatrixStep[i][1]];
		if(iterations == -1){
			var point = MapToComplexPoint(h+delta*crossStep[i][0], w+delta*crossStep[i][1]);
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
	rPix /= 4.0; rPix = parseInt(rPix);
	gPix /= 4.0; gPix = parseInt(gPix);
	bPix /= 4.0; bPix = parseInt(bPix);
	var pixColor = "rgb(" + rPix + "," + gPix + "," + bPix + ")";
	paintPixel(w, h, pixColor);
}

function assignPixelColor(w, h){
	if(paintPixelMethod == PAINT_PIXEL_METHOD_1TO1){
		var point = MapToComplexPoint(h, w);
		var iterations = iterationsToGetOutOfMandelSet(point);
		SetColor = "rgb(" + rSet + "," + gSet + "," + bSet + ")";
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
	else if(paintPixelMethod == PAINT_PIXEL_METHOD_4TO1_INDV_CROSS){
		if(h == 0 && w == 0){
			console.log("Usando 4 a 1 Indv Cross");
		}
		var rPix = 0;
		var gPix = 0;
		var bPix = 0;
		var delta = 0.25*(zoomH/Hgth);
		for(var i=0; i<4; i++){
			var point = MapToComplexPoint(h+delta*crossStep[i][0], w+delta*crossStep[i][1]);
			var iterations = iterationsToGetOutOfMandelSet(point);
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
		rPix /= 4.0; rPix = parseInt(rPix);
		gPix /= 4.0; gPix = parseInt(gPix);
		bPix /= 4.0; bPix = parseInt(bPix);
		var pixColor = "rgb(" + rPix + "," + gPix + "," + bPix + ")";
		paintPixel(w, h, pixColor);
	}
	else if(paintPixelMethod == PAINT_PIXEL_METHOD_4TO1_INDV_PLUS){
		if(h == 0 && w == 0){
			console.log("Usando 4 a 1 Indv Plus");
		}
		var rPix = 0;
		var gPix = 0;
		var bPix = 0;
		var delta = 0.25*(zoomH/Hgth);
		for(var i=0; i<4; i++){
			var point = MapToComplexPoint(h+delta*plusStep[i][0], w+delta*plusStep[i][1]);
			var iterations = iterationsToGetOutOfMandelSet(point);
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
		rPix /= 4.0; rPix = parseInt(rPix);
		gPix /= 4.0; gPix = parseInt(gPix);
		bPix /= 4.0; bPix = parseInt(bPix);
		var pixColor = "rgb(" + rPix + "," + gPix + "," + bPix + ")";
		paintPixel(w, h, pixColor);
	}
	else if(paintPixelMethod == PAINT_PIXEL_METHOD_4TO1_SHRD_CROSS){
		if(h == 0 && w == 0){
			console.log("Usando 4 a 1 Shrd Cross");
		}
		var rPix = 0;
		var gPix = 0;
		var bPix = 0;
		var delta = 0.5*(zoomH/Hgth);
		for(var i=0; i<4; i++){
			var iterations = iterMatrix[h+crossMatrixStep[i][0]][w+crossMatrixStep[i][1]];
			if(iterations == -1){
				var point = MapToComplexPoint(h+delta*crossStep[i][0], w+delta*crossStep[i][1]);
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
		rPix /= 4.0; rPix = parseInt(rPix);
		gPix /= 4.0; gPix = parseInt(gPix);
		bPix /= 4.0; bPix = parseInt(bPix);
		var pixColor = "rgb(" + rPix + "," + gPix + "," + bPix + ")";
		paintPixel(w, h, pixColor);
	}
	else if(paintPixelMethod == PAINT_PIXEL_METHOD_4TO1_SHRD_PLUS){
		if(h == 0 && w == 0){
			console.log("Usando 4 a 1 Shrd Cross");
		}
		var rPix = 0;
		var gPix = 0;
		var bPix = 0;
		var delta = 0.5*(zoomH/Hgth);
		for(var i=0; i<4; i++){
			var iterations = iterMatrix[h+plusMatrixStep[i][0]][2*w+plusMatrixStep[i][1]];
			if(iterations == -1){
				var point = MapToComplexPoint(h+delta*plusStep[i][0], w+delta*plusStep[i][1]);
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
		rPix /= 4.0; rPix = parseInt(rPix);
		gPix /= 4.0; gPix = parseInt(gPix);
		bPix /= 4.0; bPix = parseInt(bPix);
		var pixColor = "rgb(" + rPix + "," + gPix + "," + bPix + ")";
		paintPixel(w, h, pixColor);
	}
}

function drawMandelSet(){

	maxIter = parseInt(document.getElementById("iteracionesBox").value);
	
	rBackBase = parseInt(document.getElementById("redBack").value);
	gBackBase = parseInt(document.getElementById("greenBack").value);
	bBackBase = parseInt(document.getElementById("blueBack").value);
	
	rSet = parseInt(document.getElementById("redSet").value);
	gSet = parseInt(document.getElementById("greenSet").value);
	bSet = parseInt(document.getElementById("blueSet").value);
	
	closerDarker = document.getElementById("closerDarkerCheckBox").checked;
	
	if(document.getElementById("mapTypeBoxLineal").checked){
		mapType = 0;
	}
	else if(document.getElementById("mapTypeBoxExponential").checked){
		mapType = 1;
	}

	

	for(var w=0; w<Wdth; w++){
		for(var h=0; h<Hgth; h++){
			switch(paintPixelMethod){
				case PAINT_PIXEL_METHOD_1TO1:

				case PAINT_PIXEL_METHOD_4TO1_INDV_CROSS:

				case PAINT_PIXEL_METHOD_4TO1_INDV_PLUS:

				case PA
			}
			assignPixelColor(w, h); 
		}
	}

	console.log("Fractal recien salido del horno.");
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