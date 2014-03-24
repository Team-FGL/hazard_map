var landslide_polygons = new Array();
var landslide_json;

// landslideのjsonデータを取得
function Get_landslide_data(west,north,east,south){
	var url = "http://pingineer.net/cgi-bin/hazard_map/landslide.cgi?"
		+ "north=" + north
		+ "&east=" + east
		+ "&south=" + south
		+ "&west=" + west;
	//console.log(url);

	landslide_json = new XMLHttpRequest();
	landslide_json.onload = Parse_landslide_json;
	landslide_json.open("GET",url,true);
	landslide_json.send(null);
}

// 取得したlandslideのjsonデータをパースしてタイプごとに処理を振り分ける
function Parse_landslide_json() {
	var obj = JSON.parse(landslide_json.responseText);
	var latlng = new Array();
	var polygons = new Array();

	// 数が多い時は表示させない
  if(obj.hits.hits.length>=2500){
		Delete_landslide(landslide_polygons);
		Delete_landslide(landslide_markers);
		Delete_landslide(landslide_polylines);
    return;
  }


	// landslideの数分ループを回す
	for(var i =0; i<obj.hits.hits.length; i++){
		//console.log(obj.hits.hits[i]._source);
		if(obj.hits.hits[i]._id,obj.hits.hits[i]._source.geometry.type == "Polygon"){
			Parse_landslide_polygon(obj.hits.hits[i]._id,obj.hits.hits[i]._source.geometry.coordinates);
		} else if(obj.hits.hits[i]._id,obj.hits.hits[i]._source.geometry.type == "Point"){
			Parse_landslide_marker(obj.hits.hits[i]._id,obj.hits.hits[i]._source.geometry.coordinates);
		} else if(obj.hits.hits[i]._id,obj.hits.hits[i]._source.geometry.type == "LineString"){
			Parse_landslide_polyline(obj.hits.hits[i]._id,obj.hits.hits[i]._source.geometry.coordinates);
		}
	}
	Delete_landslide(landslide_polygons);
	Delete_landslide(landslide_markers);
	Delete_landslide(landslide_polylines);
}

function Parse_landslide_polygon(id,array){
		polygons=[];
		// i=0 でpolygonの外側
		// i>0 でpolygonのくり抜かれる内側
		for(var i =0; i<array.length; i++){
			var tmpArray = new Array();
			for(var j =0; j<array[i].length; j++){
				//console.log(i + ":" + j + ":" + array[i][j]);
				var k = tmpArray.length;
				tmpArray[k] = new google.maps.LatLng(
					array[i][j][1],
					array[i][j][0]
				);
			}
			polygons[i]=tmpArray;
		}
		Make_landslide_polygon(id,polygons);
}

// 画面外に出たpolygonを消す
function Delete_landslide(array) {
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
function Make_landslide_polygon(id,polygon_latlng) {
	// 同じIDのpolygonがあればスキップ
	for(var i =0; i<landslide_polygons.length; i++){
		if(landslide_polygons[i].ext.id == id){
			landslide_polygons[i].ext.keep_flg =1;
			return;
		}
	}

	var i = landslide_polygons.length;
  var polygon = new google.maps.Polygon({
    paths: polygon_latlng,
    strokeColor: "#BB5535",
    strokeOpacity: 0.8,
    strokeWeight: 2,
    fillColor: "#BB5535",
    fillOpacity: 0.35
  });

	// 直接配列上にポリゴンを作成してもうまく動かないため、一度作成してから配列上にコピー
	landslide_polygons[i] = polygon
  landslide_polygons[i].setMap(map);
	delete polygon;
	landslide_polygons[i].ext=new const_landslide(id,1);
}

function const_landslide(id,keep_flg){
  this.id = id;
  this.keep_flg = keep_flg;
}


var landslide_markers = new Array();


function Parse_landslide_marker(id,array) {
		// landslide用のmarkerの作成		
		Make_landslide(
			array[1],
			array[0],
			id
		);
}




// landslide用のMarkerの作成
function Make_landslide(lat, lng, id) {
	var array = landslide_markers;
	var icon="http://maps.google.com/mapfiles/ms/micons/fallingrocks.png";

	// 同じIDのmarkerがあればスキップ
	for(var i =0; i<array.length; i++){
		if(array[i].ext.id == id){
			array[i].ext.keep_flg =1;
			return;
		}
	}

	var myLatlng = new google.maps.LatLng(lat,lng);
	var marker = new google.maps.Marker({
		position: myLatlng,
		map: map,
		icon: icon,
	});


	// 作成したmarkerを配列にコピー
	// 直接入れるmarkerを作るとclick eventがなぜか上手く取れないため
	var i = array.length;
	array[i] = marker;
	delete marker;
	array[i].ext=new const_landslide(id,1);

}

function Parse_landslide_polyline(id,array){
		var polyline_latlng = new Array();
		for(var i =0; i<array.length; i++){
				//console.log(i + ":" + array[i]);
				var k = polyline_latlng.length;
				polyline_latlng[k] = new google.maps.LatLng(
					array[i][1],
					array[i][0]
				);
		}
		Make_landslide_polyline(id,polyline_latlng);
}

var	landslide_polylines= new Array();
function Make_landslide_polyline(id,polyline_latlng) {
	// 同じIDのpolylineがあればスキップ
	for(var i =0; i<landslide_polylines.length; i++){
		if(landslide_polylines[i].ext.id == id){
			landslide_polylines[i].ext.keep_flg =1;
			return;
		}
	}

	var i = landslide_polylines.length;
  var polyline = new google.maps.Polyline({
    path: polyline_latlng,
    strokeColor: "#BB5535",
    strokeOpacity: 0.8,
    strokeWeight: 2
  });

	// 直接配列上にポリラインを作成してもうまく動かないため、一度作成してから配列上にコピー
	landslide_polylines[i] = polyline
  landslide_polylines[i].setMap(map);
	delete polyline;
	landslide_polylines[i].ext=new const_landslide(id,1);
}

