
console.log("La vida es dura, pero es mas dura la verdura.");
var MandelCanvas = document.getElementById("MandelPicture");
var MandelLienzo = MandelCanvas.getContext("2d");

var Wdth = MandelCanvas.width;
var Hgth = MandelCanvas.height;



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

