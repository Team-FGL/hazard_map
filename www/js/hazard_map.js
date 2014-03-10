var map;
var last_time;


var directionsDisplay;
var directionsService = new google.maps.DirectionsService();

var depth;

var current_latlng,shelter_latlng;


function initialize() {

	directionsDisplay = new google.maps.DirectionsRenderer();
	var initPos = new google.maps.LatLng(35.619078,134.429391);
	var myOptions = {
		noClear : true,
		center : initPos,
		//zoom : 15,
		zoom : 16,
		mapTypeId : google.maps.MapTypeId.ROADMAP
	};
	map = new google.maps.Map(document.getElementById("map_canvas"), myOptions);
	directionsDisplay.setMap(map);


	// 現在地と避難所の情報が残っていた場合はルート検索
  if(document.getElementById('current').value !="" && document.getElementById('shelter').value !=""){
		calcRoute();
	}

	// 少し間をおいてからjsonを読み込む
	// 機能してないかも
	window.setTimeout(function() {
		Get_json_data();
	}, 1500);


	// 現在地が残っていた場合はそこをセンターにする
	if(document.getElementById("current").value !=""){
		Get_latlng_from_address("current");
	} else {
		getCurrentLocation();
	}


	// 画面の中心が変わったらjsonの再取得と再ロード
  google.maps.event.addListener(map, 'center_changed', function() {
    // 3 seconds after the center of the map has changed, rewrite kml layer.
    window.setTimeout(function() {
			if(water_level_overlay_layer){water_level_overlay_layer.setMap(null);}
			if(rainfall_overlay_layer){rainfall_overlay_layer.setMap(null);}
			Get_json_data();
    }, 3000);
  });

	// zoomが変わったらkmlファイルの再取得と再ロード
  google.maps.event.addListener(map, 'zoom_changed', function() {
    window.setTimeout(function() {
			if(water_level_overlay_layer){water_level_overlay_layer.setMap(null);}
			if(rainfall_overlay_layer){rainfall_overlay_layer.setMap(null);}
			Get_json_data();
    }, 3000);
  });

	Main_loop();

}


function Get_json_data() {
	Read_water_level_overlay_kml();
	Read_rainfall_overlay_kml();

	/*
	setTimeout後に連続して何度もこの関数が呼ばれているようなので、
	1.5秒以内の場合はスキップする暫定対処
	*/
	var current_time = Date.now();
	if(current_time <= last_time + 1500){ return;}
	last_time = current_time;

	var north = map.getBounds().getNorthEast().lat();
	var east  = map.getBounds().getNorthEast().lng();
	var south = map.getBounds().getSouthWest().lat();
	var west = map.getBounds().getSouthWest().lng();
	var zoom = map.getZoom();
	depth = $("select[name=flood-level]").val();
	//east = Check_east(east,west);


	// 表示するにチェックが入っている場合のみ更新
	Get_shelter_data(west,north,east,south);

	if($("input[name=flood-level]:checked").val()==1){
		Get_flood_data(west,north,east,south,depth);
	}

	if($("input[name=water_level]:checked").val()==1){
		Get_water_level_data(west,north,east,south);
	}

	if($("input[name=rainfall]:checked").val()==1){
		Get_rainfall_data(west,north,east,south);
	}

	if($("input[name=livecam]:checked").val()==1){
		Get_live_cam_data(west,north,east,south);
	}

	if($("input[name=landslide]:checked").val()==1){
		Get_landslide_data(west,north,east,south);
	}

}


function Check_east(east,west) {
	// 東側が西半球に行ってしまった時用
	// どうせ日本だけなのでヘタレる
	if(east < west && east <0){
		east = 180;
	}
	return east;
}


function Main_loop() {
	if($("input[name=center-position]:checked").val()!=1){ return; }
	getCurrentLocation();
	window.setTimeout(function() {
		Main_loop();
	}, 15000);

}
