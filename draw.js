
console.log("La vida es dura, pero es mas dura la verdura.");
var MandelCanvas = document.getElementById("MandelPicture");
var MandelLienzo = MandelCanvas.getContext("2d");

var Wdth = MandelCanvas.width;
var Hgth = MandelCanvas.height;
var numIter;

document.getElementById("drawButton").addEventListener("click", DrawMandelSet);

function PintaPixel(x, y, color){
	MandelLienzo.fillStyle = color;
	MandelLienzo.fillRect(x, y, 1, 1);
}

var m = 3;
var n = m*Hgth/Wdth;
var vm = -2.2;
var	vn = -n/2.0;

function MapToComplexPoint(x, y){
	x *= n; 
	y *= m;
	x /= Hgth; 
	y /= Wdth;
	x += vn; 
	y += vm;
	return math.complex(y, x);
}

function isInMandelSet(C){

	var Z = math.complex(0, 0);
	var cont = 0;
	var f = true;
	
	while(f && cont < numIter){
		if(Z.re*Z.re + Z.im*Z.im < 4.0){
			Z = math.add(math.multiply(Z, Z), C);
			cont++;
		}
		else
			f = false;
	}
	
	return f;
}

function DrawMandelSet(){

	numIter = parseInt(document.getElementById("iteracionesBox").value);
	var rBack = parseInt(document.getElementById("redBack").value);
	var gBack = parseInt(document.getElementById("greenBack").value);
	var bBack = parseInt(document.getElementById("blueBack").value);
	var rSet = parseInt(document.getElementById("redSet").value);
	var gSet = parseInt(document.getElementById("greenSet").value);
	var bSet = parseInt(document.getElementById("blueSet").value);

	var BackColor = "rgb(" + rBack + "," + gBack + "," + bBack + ")";
	var SetColor = "rgb(" + rSet + "," + gSet + "," + bSet + ")";

	for(var w=0; w<Wdth; w++){
		for(var h=0; h<Hgth; h++){
			var point = MapToComplexPoint(h, w);
			if(isInMandelSet(point))
				PintaPixel(w, h, SetColor);
			else
				PintaPixel(w, h, BackColor);
		}
	}
}