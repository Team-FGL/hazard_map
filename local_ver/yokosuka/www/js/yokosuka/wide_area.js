var wide_area_polygons = new Array();
var wide_area_json;

// wide_areaのjsonデータを取得
function Get_wide_area_data(){
	//var url = "json/wide_area.geojson";
	var url = "http://yokosuka-opendata.ubin.jp/dataset/53106583-ba72-43ce-ae4d-08d4b1a0aa37/resource/10e8a3f6-9c0b-4340-8588-52ea6a4a5a88/download/2013.4.geojson";

	//console.log(url);

	wide_area_json = new XMLHttpRequest();
	wide_area_json.onload = Parse_wide_area_json;
	wide_area_json.open("GET",url,true);
	wide_area_json.send(null);
}

// 取得したwide_areaのjsonデータをパースしてポリゴンを作成
function Parse_wide_area_json() {
	var obj = JSON.parse(wide_area_json.responseText);
	var latlng = new Array();
	var polygons = new Array();
	//console.log(obj);
	//console.log(obj.features);
	// wide_areaの数分ループを回す
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
		Make_wide_area(polygons);
	}
	//Delete_wide_area_polygons(wide_area_polygons);
}

// 画面外に出たpolygonを消す
function Delete_wide_area_polygons(array) {
	for(var i=0; i<array.length; i++){
			array[i].setMap(null);
			array.splice(i,1);
			i--;
	}
}

// ポリゴンの作成
function Make_wide_area(polygon_latlng) {
	var i = wide_area_polygons.length;
  polygon = new google.maps.Polygon({
    paths: polygon_latlng,
    strokeColor: "#008888",
    strokeOpacity: 0.8,
    strokeWeight: 2,
    fillColor: "#008888",
    fillOpacity: 0.35
  });

	// 直接配列上にポリゴンを作成してもうまく動かないため、一度作成してから配列上にコピー
	wide_area_polygons[i] = polygon
  wide_area_polygons[i].setMap(map);
	delete polygon;
}

