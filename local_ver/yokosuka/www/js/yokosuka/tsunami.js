var tsunami_area1_rank1_polygons = new Array();
var tsunami_area1_rank1_json;
var tsunami_area1_rank2_polygons = new Array();
var tsunami_area1_rank2_json;
var tsunami_area1_rank3_polygons = new Array();
var tsunami_area1_rank3_json;
var tsunami_area2_rank1_polygons = new Array();
var tsunami_area2_rank1_json;
var tsunami_area2_rank2_polygons = new Array();
var tsunami_area2_rank2_json;
var tsunami_area2_rank3_polygons = new Array();
var tsunami_area2_rank3_json;
var tsunami_area3_rank1_polygons = new Array();
var tsunami_area3_rank1_json;
var tsunami_area3_rank2_polygons = new Array();
var tsunami_area3_rank2_json;
var tsunami_area3_rank3_polygons = new Array();
var tsunami_area3_rank3_json;

// tsunamiのjsonデータを取得
function Get_tsunami_data(json_obj,polygon_obj,file_name){
	var url = "json/tsunami/" + file_name;

	//console.log(url);

	json_obj = new XMLHttpRequest();
	json_obj.onload = Parse_tsunami_1_1_json(json_obj,polygon_obj);
	json_obj.open("GET",url,true);
	json_obj.send(null);
}

// 取得したtsunami_1_1のjsonデータをパースしてポリゴンを作成
function Parse_tsunami_1_1_json(json_obj,polygon_obj) {
	var obj = JSON.parse(json_obj.responseText);
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
		Make_tsunami_1_1(polygons,polygon_obj);
	}
	//Delete_tsunami_1_1_polygons(tsunami_1_1_polygons);
}

// 画面外に出たpolygonを消す
function Delete_tsunami_1_1_polygons(array) {
	for(var i=0; i<array.length; i++){
		if(array[i].ext.keep_flg == 1){
			// keep_flgが1なら0に戻して次の処理に備える
			array[i].ext.keep_flg = 0;
		} else {
			// keep_flgが0ならpolygonの配列等を削除
			delete array[i].ext;
			array[i].setMap(null);
			array.splice(i,1);
			i--;
		}
	}
}

// ポリゴンの作成
function Make_tsunami_1_1(polygon_latlng,polygon_obj) {
	// 同じIDのpolygonがあればスキップ
	for(var i =0; i<tsunami_1_1_polygons.length; i++){
		if(tsunami_1_1_polygons[i].ext.id == id){
			tsunami_1_1_polygons[i].ext.keep_flg =1;
			return;
		}
	}

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

