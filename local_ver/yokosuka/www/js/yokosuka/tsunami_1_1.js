var tsunami_1_1_polygons = new Array();
var tsunami_1_1_json;

// tsunami_1_1のjsonデータを取得
function Get_tsunami_1_1_data(){
	var url = "json/tsunami/area1_rank1.geojson";

	//console.log(url);

	tsunami_1_1_json = new XMLHttpRequest();
	tsunami_1_1_json.onload = Parse_tsunami_1_1_json;
	tsunami_1_1_json.open("GET",url,true);
	tsunami_1_1_json.send(null);
}

// 取得したtsunami_1_1のjsonデータをパースしてポリゴンを作成
function Parse_tsunami_1_1_json() {
	var obj = JSON.parse(tsunami_1_1_json.responseText);
	var latlng = new Array();
	var polygons = new Array();
	//console.log(obj);
	//console.log(obj.features);
	// tsunami_1_1の数分ループを回す
	for(var i =0; i<obj.features.length; i++){
		//console.log(obj.features[i].geometry);
		polygons=[];
		// j=0 でpolygonの外側
		// j>0 でpolygonのくり抜かれる内側
		for(var j =0; j<obj.features[i].geometry.coordinates.length; j++){
			var tmpArray = new Array();
			for(var k =0; k<obj.features[i].geometry.coordinates[j].length; k++){
				//console.log(i + ":" + j + ":" + obj.features[i].geometry.coordinates[j][k]);
				var l = tmpArray.length;
				tmpArray[l] = new google.maps.LatLng(
					obj.features[i].geometry.coordinates[j][k][1],
					obj.features[i].geometry.coordinates[j][k][0]
				);
			}
			polygons[j]=tmpArray;
		}
		Make_tsunami_1_1(polygons);
	}
	//Delete_tsunami_1_1_polygons(tsunami_1_1_polygons);
}

// 画面外に出たpolygonを消す
function Delete_tsunami_1_1_polygons(array) {
	for(var i=0; i<array.length; i++){
			array[i].setMap(null);
			array.splice(i,1);
			i--;
	}
}

// ポリゴンの作成
function Make_tsunami_1_1(polygon_latlng) {
	var i = tsunami_1_1_polygons.length;
  polygon = new google.maps.Polygon({
    paths: polygon_latlng,
    strokeColor: "#0000FF",
    strokeOpacity: 0.8,
    strokeWeight: 2,
    fillColor: "#0000FF",
    fillOpacity: 0.35
  });

	// 直接配列上にポリゴンを作成してもうまく動かないため、一度作成してから配列上にコピー
	tsunami_1_1_polygons[i] = polygon
  tsunami_1_1_polygons[i].setMap(map);
	delete polygon;
}

