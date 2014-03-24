var flood_polygons = new Array();
var flood_json;

// floodのjsonデータを取得
function Get_flood_data(west,north,east,south,depth){
	var url = "http://pingineer.net/cgi-bin/hazard_map/flood.cgi?"
		+ "north=" + north
		+ "&east=" + east
		+ "&south=" + south
		+ "&west=" + west
		+ "&depth=" + depth;

	//console.log(url);

	flood_json = new XMLHttpRequest();
	flood_json.onload = Parse_flood_json;
	flood_json.open("GET",url,true);
	flood_json.send(null);
}

// 取得したfloodのjsonデータをパースしてポリゴンを作成
function Parse_flood_json() {
	var obj = JSON.parse(flood_json.responseText);
	var latlng = new Array();
	var polygons = new Array();
	if(obj.hits.hits.length>=2500){
		Delete_flood_polygons(flood_polygons);
		return;
	}
	// floodの数分ループを回す
	for(var i =0; i<obj.hits.hits.length; i++){
		//console.log(obj.hits.hits[i]._source);
		polygons=[];
		// j=0 でpolygonの外側
		// j>0 でpolygonのくり抜かれる内側
		for(var j =0; j<obj.hits.hits[i]._source.geometry.coordinates.length; j++){
			var tmpArray = new Array();
			for(var k =0; k<obj.hits.hits[i]._source.geometry.coordinates[j].length; k++){
				//console.log(i + ":" + j + ":" + obj.hits.hits[i]._source.geometry.coordinates[j][k]);
				var l = tmpArray.length;
				tmpArray[l] = new google.maps.LatLng(
					obj.hits.hits[i]._source.geometry.coordinates[j][k][1],
					obj.hits.hits[i]._source.geometry.coordinates[j][k][0]
				);
			}
			polygons[j]=tmpArray;
		}
		Make_flood(obj.hits.hits[i]._id,polygons);
	}
	Delete_flood_polygons(flood_polygons);
}

// 画面外に出たpolygonを消す
function Delete_flood_polygons(array) {
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
function Make_flood(id,polygon_latlng) {
	// 同じIDのpolygonがあればスキップ
	for(var i =0; i<flood_polygons.length; i++){
		if(flood_polygons[i].ext.id == id){
			flood_polygons[i].ext.keep_flg =1;
			return;
		}
	}

	var i = flood_polygons.length;
  polygon = new google.maps.Polygon({
    paths: polygon_latlng,
    strokeColor: "#0095D9",
    strokeOpacity: 0.8,
    strokeWeight: 2,
    fillColor: "#0095D9",
    fillOpacity: 0.35
  });

	// 直接配列上にポリゴンを作成してもうまく動かないため、一度作成してから配列上にコピー
	flood_polygons[i] = polygon
  flood_polygons[i].setMap(map);
	delete polygon;
	flood_polygons[i].ext=new const_flood(id,1);
}

function const_flood(id,keep_flg){
  this.id = id;
  this.keep_flg = keep_flg;
}
