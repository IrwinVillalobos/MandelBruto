
console.log("La vida es dura, pero es mas dura la verdura.");
var MandelCanvas = document.getElementById("MandelPicture");
var MandelLienzo = MandelCanvas.getContext("2d");

var Wdth = MandelCanvas.width;
var Hgth = MandelCanvas.height;
var numIter;

document.getElementById("drawButton").addEventListener("click", DrawMandelSet);

function PintaPixel(x, y, color){
	MandelLienzo.beginPath();
	MandelLienzo.strokeStyle = color;
	MandelLienzo.moveTo(x, y);
	MandelLienzo.lineTo(x+1, y);
	MandelLienzo.lineTo(x+1, y+1);
	MandelLienzo.lineTo(x, y+1);
	MandelLienzo.lineTo(x, y);
	MandelLienzo.stroke();
	MandelLienzo.closePath();	
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
		if(C.re == 0  && C.im == 0){
			console.log("Pito " + Z);
			console.log(Z.re + " --- " + Z.im)
		}
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
	var rBack = parseInt(document.getElementById("redBox").value);
	var gBack = parseInt(document.getElementById("greenBox").value);
	var bBack = parseInt(document.getElementById("blueBox").value);
	var BackColor = "rgb(" + rBack + "," + gBack + "," + bBack + ")";
	var SetColor = "rgb(0,0,0)";

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