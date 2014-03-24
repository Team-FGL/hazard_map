var tsunami_area2_rank2_polygons = new Array();
var tsunami_area2_rank2_json;

// tsunami_area2_rank2のjsonデータを取得
function Get_tsunami_area2_rank2_data(){
	//var url = "json/tsunami/area2_rank2.geojson";
	var url = "http://yokosuka-opendata.ubin.jp/dataset/785ae12f-223b-41f2-8715-523a38d8adb7/resource/eb748b26-241b-4682-9dc6-228866047498/download/area2rank2polygon.geojson";

	//console.log(url);

	tsunami_area2_rank2_json = new XMLHttpRequest();
	tsunami_area2_rank2_json.onload = Parse_tsunami_area2_rank2_json;
	tsunami_area2_rank2_json.open("GET",url,true);
	tsunami_area2_rank2_json.send(null);
}

// 取得したtsunami_area2_rank2のjsonデータをパースしてポリゴンを作成
function Parse_tsunami_area2_rank2_json() {
	var obj = JSON.parse(tsunami_area2_rank2_json.responseText);
	var latlng = new Array();
	var polygons = new Array();
	//console.log(obj);
	//console.log(obj.features);
	// tsunami_area2_rank2の数分ループを回す
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
		Make_tsunami_area2_rank2(polygons);
	}
	//Delete_tsunami_area2_rank2_polygons(tsunami_area2_rank2_polygons);
}

// 画面外に出たpolygonを消す
function Delete_tsunami_area2_rank2_polygons(array) {
	for(var i=0; i<array.length; i++){
			array[i].setMap(null);
			array.splice(i,1);
			i--;
	}
}

// ポリゴンの作成
function Make_tsunami_area2_rank2(polygon_latlng) {
	var i = tsunami_area2_rank2_polygons.length;
  polygon = new google.maps.Polygon({
    paths: polygon_latlng,
    strokeColor: "#0000FF",
    strokeOpacity: 0.8,
    strokeWeight: 2,
    fillColor: "#0000FF",
    fillOpacity: 0.35
  });

	// 直接配列上にポリゴンを作成してもうまく動かないため、一度作成してから配列上にコピー
	tsunami_area2_rank2_polygons[i] = polygon
  tsunami_area2_rank2_polygons[i].setMap(map);
	delete polygon;
}

