var flood_map_layer;
var hinanjyo_layer;
var water_level_layer;
var water_level_overlay_layer;
var livecam_layer;
var landslide_layer;
var rainfall_layer;
var rainfall_overlay_layer;

var directionsDisplay;
var directionsService = new google.maps.DirectionsService();
var map;

var depth;

var last_time;
var kankou_flg=0;


function initialize() {

	directionsDisplay = new google.maps.DirectionsRenderer();
	//var initPos = new google.maps.LatLng(35.619078,134.429391);
	var initPos = new google.maps.LatLng(35.0116391,135.7680321);
	var myOptions = {
		noClear : true,
		center : initPos,
		//zoom : 15,
		zoom : 16,
		mapTypeId : google.maps.MapTypeId.ROADMAP
	};
	//var map = new google.maps.Map(document.getElementById("map_canvas"), myOptions);
	map = new google.maps.Map(document.getElementById("map_canvas"), myOptions);
	directionsDisplay.setMap(map);


	// 現在地と避難所の情報が残っていた場合はルート検索
  if(document.getElementById('current').value !="" && document.getElementById('shelter').value !=""){
		calcRoute();
	}

	// 少し間をおいてからkmlを読み込む
	// 機能してないかも
	window.setTimeout(function() {
		//Read_kml(map);
		Read_kml();
	}, 1500);


	// 現在地が残っていた場合はそこをセンターにする
	if(document.getElementById("current").value !=""){
		Get_latlng_from_address("current");
/*
京都をセンターで始めるために停止
	} else {
		getCurrentLocation();
*/
	}



	// 画面の中心が変わったらkmlファイルの再取得と再ロード
  google.maps.event.addListener(map, 'center_changed', function() {
    // 3 seconds after the center of the map has changed, rewrite kml layer.
    window.setTimeout(function() {
			Clear_kml();
			//Read_kml(map);
			Read_kml();
    }, 3000);
  });

	// zoomが変わったらkmlファイルの再取得と再ロード
  google.maps.event.addListener(map, 'zoom_changed', function() {
    window.setTimeout(function() {
			Clear_kml();
			//Read_kml(map);
			Read_kml();
    }, 3000);
  });

	Main_loop();

}

function Clear_kml() {
	if(flood_map_layer){flood_map_layer.setMap(null);}
	if(hinanjyo_layer){hinanjyo_layer.setMap(null);}
	if(water_level_layer){water_level_layer.setMap(null);}
	if(water_level_overlay_layer){water_level_overlay_layer.setMap(null);}
	if(livecam_layer){livecam_layer.setMap(null);}
	if(landslide_layer){landslide_layer.setMap(null);}
	if(rainfall_layer){rainfall_layer.setMap(null);}
	if(rainfall_overlay_layer){rainfall_overlay_layer.setMap(null);}
}

function Read_kml() {
	if(kankou_flg){
		document.getElementById('current').value=document.getElementById('kankou_current').value;
		Read_flood_kml();
		Read_shelter_kml();
		Read_water_level_kml();
		Read_water_level_overlay_kml();
		Read_livecam_kml();
		Read_landslide_kml();
		Read_rainfall_kml();
		Read_rainfall_overlay_kml();
	}
	// window.setTimeoutの秒数後、何度もこの関数が呼ばれているようなので3秒以内の変化はスキップするよう暫定対処
	var current_time = Date.now();
	if(current_time <= last_time + 3000){ return; }
	last_time = Date.now();
	// オープンデータアプリコンテスト用
	if(kankou_flg){
		// 避難所
		Get_kyoto_shelter_json_data();
		// 広域避難所
		Get_kyoto_escape_json_data();
		// 救急救助拠点
		Get_kyoto_rescue_json_data();
		// 帰宅支援ステーション
		Get_kyoto_ess_json_data();
		// NTT防災実証用
		Get_kyoto_bousai_json_data();
	}
	// 都道府県庁
	Get_kyoto_pgo_json_data();
	// 市役所
	Get_kyoto_cgo_json_data();
	// 区役所
	Get_kyoto_ward_office_json_data();
	// 支所
	Get_kyoto_bgo_json_data();
	// 駅
	Get_kyoto_train_station_json_data();
	// バス停
	Get_kyoto_bus_stop_json_data();
	// 駐車場
	Get_kyoto_car_parking_json_data();
	// 駐輪場
	Get_kyoto_bicycles_parking_json_data();
	// お土産店
	Get_kyoto_souvenirs_json_data();
	// 飲食施設
	Get_kyoto_cookshop_json_data();
	// 観光施設
	Get_kyoto_sightseeing_json_data();
	// 寺社仏閣
	Get_kyoto_religious_facility_json_data();
}

function Read_flood_kml() {
	if($("input[name=flood-level]:checked").val()!=1){ return; }

	depth = $("select[name=flood-level]").val();


	// 広域表示で東端が西経になると正常に表示されなくなるのに対応
	// どうせ国内表示だけなのでヘタレる
	var east = map.getBounds().getNorthEast().lng();
	if(east <=0){ east = 180;}

	//KMLファイルの読み込み
	// flood map
	var kmlUrl = "http://pingineer.net/cgi-bin/flood-map/flood-map.cgi?north=" + map.getBounds().getNorthEast().lat()
		+ "&east=" + east
		+ "&south=" + map.getBounds().getSouthWest().lat()
		+ "&west=" + map.getBounds().getSouthWest().lng()
		+ "&zoom=" + map.getZoom()
		+ "&depth=" + depth;
	//flood_map_layer = new google.maps.KmlLayer(kmlUrl, {preserveViewport:true});
	flood_map_layer = new google.maps.KmlLayer(kmlUrl, {
		preserveViewport:true,
		suppressInfoWindows: true
	});
	flood_map_layer.setMap(map);
//alert(kmlUrl);
}

function Read_shelter_kml() {
	var p20_007=0, p20_008=0, p20_009=0, p20_010=0, p20_011=0, p20_012=0;
	if($("input[name=p20_007]:checked").val()==1){p20_007=1;}
	if($("input[name=p20_008]:checked").val()==1){p20_008=1;}
	if($("input[name=p20_009]:checked").val()==1){p20_009=1;}
	if($("input[name=p20_010]:checked").val()==1){p20_010=1;}
	if($("input[name=p20_011]:checked").val()==1){p20_011=1;}
	if($("input[name=p20_012]:checked").val()==1){p20_012=1;}


	// 広域表示で東端が西経になると正常に表示されなくなるのに対応
	// どうせ国内表示だけなのでヘタレる
	var east = map.getBounds().getNorthEast().lng();
	if(east <=0){ east = 180;}

	// hinanjyo map
	var kmlUrl = "http://pingineer.net/cgi-bin/flood-map/hinanjyo.cgi?north=" + map.getBounds().getNorthEast().lat()
		+ "&east=" + east
		+ "&south=" + map.getBounds().getSouthWest().lat()
		+ "&west=" + map.getBounds().getSouthWest().lng()
		+ "&zoom=" +map.getZoom()
		+ "&p20_007=" + p20_007
		+ "&p20_008=" + p20_008
		+ "&p20_009=" + p20_009
		+ "&p20_010=" + p20_010
		+ "&p20_011=" + p20_011
		+ "&p20_012=" + p20_012;
	//kmlUrl ="http://pingineer.net/flood-map/test2.kml";
	//hinanjyo_layer = new google.maps.KmlLayer(kmlUrl, {preserveViewport:true});
	hinanjyo_layer = new google.maps.KmlLayer(kmlUrl, {
		preserveViewport:true,
		suppressInfoWindows: true
	});
	hinanjyo_layer.setMap(map);

	// 避難所をクリックしたらinfoWindowを表示
	google.maps.event.addListener(hinanjyo_layer, 'click', function(kmlEvent) {
		showInContentWindow(map, kmlEvent.latLng, kmlEvent.featureData.description);
		//showInContentWindow(map, kmlEvent.latLng, kmlEvent.featureData.description, kmlEvent.featureData.name);
		//showInContentWindow(map, kmlEvent.latLng, kmlEvent.featureData.name);
		//showInContentWindow(map, kmlEvent.latLng, "kamokamotest");
		//alert(JSON.stringify(kmlEvent)); 
	});
}

function Read_water_level_kml() {
	if($("input[name=water_level]:checked").val()!=1){ return; }

	// 広域表示で東端が西経になると正常に表示されなくなるのに対応
	// どうせ国内表示だけなのでヘタレる
	var east = map.getBounds().getNorthEast().lng();
	if(east <=0){ east = 180;}


	// water-level
	// ライブ水位データ
	var kmlUrl = "http://pingineer.net/cgi-bin/flood-map/water-level.cgi?north=" + map.getBounds().getNorthEast().lat()
		+ "&east=" + east
		+ "&south=" + map.getBounds().getSouthWest().lat()
		+ "&west=" + map.getBounds().getSouthWest().lng()
		+ "&zoom=" +map.getZoom();
	water_level_layer = new google.maps.KmlLayer(kmlUrl, {
		preserveViewport:true,
		suppressInfoWindows: true
	});
	water_level_layer.setMap(map);
	// リアルタイム水位計測点をクリックしたらinfowindow表示
	google.maps.event.addListener(water_level_layer, 'click', function(kmlEvent) {
		ShowWaterLevelWindow(map, kmlEvent.latLng, kmlEvent.featureData.description);
	});
}

function Read_water_level_overlay_kml() {
	if($("input[name=water_level_overlay]:checked").val()!=1){ return; }

	// 広域表示で東端が西経になると正常に表示されなくなるのに対応
	// どうせ国内表示だけなのでヘタレる
	var east = map.getBounds().getNorthEast().lng();
	if(east <=0){ east = 180;}


	//KMLファイルの読み込み
	// water_level_overlay map
	var kmlUrl = "http://pingineer.net/cgi-bin/flood-map/water-level_overlay.cgi?north=" + map.getBounds().getNorthEast().lat()
		+ "&east=" + east
		+ "&south=" + map.getBounds().getSouthWest().lat()
		+ "&west=" + map.getBounds().getSouthWest().lng();
	//	+ "&zoom=" + map.getZoom()
	//	+ "&depth=" + depth;
	water_level_overlay_layer = new google.maps.KmlLayer(kmlUrl, {
		preserveViewport:true,
		suppressInfoWindows: true
	});
	water_level_overlay_layer.setMap(map);
}

function Read_livecam_kml() {
	if($("input[name=livecam]:checked").val()!=1){ return; }

	// 広域表示で東端が西経になると正常に表示されなくなるのに対応
	// どうせ国内表示だけなのでヘタレる
	var east = map.getBounds().getNorthEast().lng();
	if(east <=0){ east = 180;}


	// live_camera
	var kmlUrl = "http://pingineer.net/cgi-bin/flood-map/live-cam.cgi?north=" + map.getBounds().getNorthEast().lat()
		+ "&east=" + east
		+ "&south=" + map.getBounds().getSouthWest().lat()
		+ "&west=" + map.getBounds().getSouthWest().lng()
		+ "&zoom=" +map.getZoom();
	//alert(kmlUrl);
	livecam_layer = new google.maps.KmlLayer(kmlUrl, {
		preserveViewport:true,
		suppressInfoWindows: true
	});
	livecam_layer.setMap(map);
	// ライブカメラをクリックしたらinfowindow表示
	google.maps.event.addListener(livecam_layer, 'click', function(kmlEvent) {
		ShowLiveCamWindow(map, kmlEvent.latLng, kmlEvent.featureData.name, kmlEvent.featureData.description);
		//ShowLiveCamWindow(map, kmlEvent.latLng, kmlEvent.featureData.description);
	});


}


function Read_landslide_kml() {
	if($("input[name=landslide]:checked").val()!=1){ return; }

	// 広域表示で東端が西経になると正常に表示されなくなるのに対応
	// どうせ国内表示だけなのでヘタレる
	var east = map.getBounds().getNorthEast().lng();
	if(east <=0){ east = 180;}


	//KMLファイルの読み込み
	// landslide map
	var kmlUrl = "http://pingineer.net/cgi-bin/flood-map/landslide.cgi?north=" + map.getBounds().getNorthEast().lat()
		+ "&east=" + east
		+ "&south=" + map.getBounds().getSouthWest().lat()
		+ "&west=" + map.getBounds().getSouthWest().lng()
		+ "&zoom=" + map.getZoom()
		+ "&depth=" + depth;
	//flood_map_layer = new google.maps.KmlLayer(kmlUrl, {preserveViewport:true});
	landslide_layer = new google.maps.KmlLayer(kmlUrl, {
		preserveViewport:true,
		suppressInfoWindows: true
	});
	landslide_layer.setMap(map);
}

function Read_rainfall_kml() {
	if($("input[name=rainfall]:checked").val()!=1){ return; }

	// 広域表示で東端が西経になると正常に表示されなくなるのに対応
	// どうせ国内表示だけなのでヘタレる
	var east = map.getBounds().getNorthEast().lng();
	if(east <=0){ east = 180;}


	// rainfall
	// ライブ雨量データ
	var kmlUrl = "http://pingineer.net/cgi-bin/flood-map/rainfall.cgi?north=" + map.getBounds().getNorthEast().lat()
		+ "&east=" + east
		+ "&south=" + map.getBounds().getSouthWest().lat()
		+ "&west=" + map.getBounds().getSouthWest().lng();
		//+ "&zoom=" +map.getZoom();
	rainfall_layer = new google.maps.KmlLayer(kmlUrl, {
		preserveViewport:true,
		suppressInfoWindows: true
	});
	rainfall_layer.setMap(map);
	// リアルタイム雨量計測点をクリックしたらinfowindow表示
	google.maps.event.addListener(rainfall_layer, 'click', function(kmlEvent) {
		ShowRainfallWindow(map, kmlEvent.latLng, kmlEvent.featureData.description);
	});
}

function Read_rainfall_overlay_kml() {
	if($("input[name=rainfall_overlay]:checked").val()!=1){ return; }

	// 広域表示で東端が西経になると正常に表示されなくなるのに対応
	// どうせ国内表示だけなのでヘタレる
	var east = map.getBounds().getNorthEast().lng();
	if(east <=0){ east = 180;}


	//KMLファイルの読み込み
	// rainfall_overlay map
	var kmlUrl = "http://pingineer.net/cgi-bin/flood-map/rainfall_overlay.cgi?north=" + map.getBounds().getNorthEast().lat()
		+ "&east=" + east
		+ "&south=" + map.getBounds().getSouthWest().lat()
		+ "&west=" + map.getBounds().getSouthWest().lng();
	//	+ "&zoom=" + map.getZoom()
	//	+ "&depth=" + depth;
	rainfall_overlay_layer = new google.maps.KmlLayer(kmlUrl, {
		preserveViewport:true,
		suppressInfoWindows: true
	});
	rainfall_overlay_layer.setMap(map);
}


// 避難所のmarkerをクリックしたらinfoWindowを表示
function showInContentWindow(map, position, text) {
  //var content = "<div style='margin-left:20px;border:2px dotted #897823;'>" + text +  "</div>";
  //content = content + "<br><div id='infowindowclass'>ここを避難所にする</div>";
  //var content = "<div id='infowindowclass'>" + text + "</div>";
  //var content = "<div id='infowindowclass'>" + text;
  var content = "<div id='infowindowclass'><button type='button' onclick='change_shelter(\"" + position + "\");'>ここに避難する</button><hr>" + text + "</div>";
  var infowindow = new google.maps.InfoWindow({
    content: content,
    position: position
  })
  infowindow.open(map);
}


// テレメーター水位観測所のmarkerをクリックしたらinfoWindowを表示
function ShowWaterLevelWindow(map, position, text) {
	// <a href>タグの中に勝手に包まれてるのでそれを削除
	var tmp_url = text.split(">")
	var url = tmp_url[1].replace("</a","");
	url = url.replace("http://www.river.go.jp/","http://153.121.40.227/river/html/full/");

	if($("select[name=water_level_select]").val() == 10){
		url = url.replace("timeAxis=60","timeAxis=10");
	}
 
 if(url.search("timeAxis") != -1){
  	//var content = "<div style='height:140px;width:370px;'><object style='height:100%;width:100%;' data='" + url + "'>表示できませんでした</object></div>";
  	var content = "<div id='water-level-windowclass'><object style='height:100%;width:100%;' data='" + url + "'>表示できませんでした</object></div>";
	} else {
  	var content = "<div id='water-level-area-windowclass'><object style='height:100%;width:100%;' data='" + url + "'>表示できませんでした</object></div>";
	}
  var infowindow = new google.maps.InfoWindow({
    content: content,
    position: position
  })
  infowindow.open(map);
}


// ライブカメラのmarkerをクリックしたらinfoWindowを表示
function ShowLiveCamWindow(map, position, name, text) {
  //var content = "<div id='livecam-windowclass'>" + text + "</div>";
	// <a href>タグの中に勝手に包まれてるのでそれを削除
	var tmp_url = text.split(">")
	var url = tmp_url[1].replace("</a","");
  if(url.search("mlit.go.jp") != -1){
  	var content = "<div id='livecam-windowclass'><a href=\"" + url + "\">" + name + "</a></div>";
	} else {
  	var content = "<div style='height:520px;width:520px;'><object style='height:100%;width:100%;' data='" + url + "'>表示できませんでした</object></div>";
	}
  var infowindow = new google.maps.InfoWindow({
    content: content,
    position: position
  })
  infowindow.open(map);
}

function ShowRainfallWindow(map, position, text) {
	// <a href>タグの中に勝手に包まれてるのでそれを削除
	var tmp_url = text.split(">")
	var url = tmp_url[1].replace("</a","");
	url = url.replace("http://www.river.go.jp/","http://153.121.40.227/river/html/full/");

	if($("select[name=rainfall_select]").val() == 10){
		url = url.replace("timeAxis=60","timeAxis=10");
	}
 
  if(url.search("timeAxis") != -1){
  	var content = "<div id='rainfall-windowclass'><object style='height:100%;width:100%;' data='" + url + "'>表示できませんでした</object></div>";
	} else {
  	var content = "<div id='rainfall-area-windowclass'><object style='height:100%;width:100%;' data='" + url + "'>表示できませんでした</object></div>";
	}
  var infowindow = new google.maps.InfoWindow({
    content: content,
    position: position
  })
  infowindow.open(map);
}








function Flood_level_change(value) {
	//depth = value;
	//flood_map_layer.setMap(null);
	if(flood_map_layer){flood_map_layer.setMap(null);}
	Read_flood_kml();
}

function Shelter_change(value) {
	hinanjyo_layer.setMap(null);
	Read_shelter_kml();
}

function Water_level_change(value) {
	if(water_level_layer){water_level_layer.setMap(null);}
	Read_water_level_kml();
}

function Water_level_overlay_change(value) {
	if(water_level_overlay_layer){water_level_overlay_layer.setMap(null);}
	Read_water_level_overlay_kml();
}

function Livecam_change(value) {
	if(livecam_layer){livecam_layer.setMap(null);}
	Read_livecam_kml();
}

function Rainfall_change(value) {
	if(rainfall_layer){rainfall_layer.setMap(null);}
	Read_rainfall_kml();
}

function Rainfall_overlay_change(value) {
	if(rainfall_overlay_layer){rainfall_overlay_layer.setMap(null);}
	Read_rainfall_overlay_kml();
}

function Landslide_change(value) {
	if(landslide_layer){landslide_layer.setMap(null);}
	Read_landslide_kml();
}

function Main_loop() {
	if($("input[name=center-position]:checked").val()!=1){ return; }
	getCurrentLocation();
	window.setTimeout(function() {
		Main_loop();
	}, 15000);
}

function kankou_change(value){
	kankou_flg= 1 - kankou_flg;
	if(value == "観光モードを表示する"){
		Delete_kyoto_shelter();
		Delete_kyoto_escape();
		Delete_kyoto_rescue();
		Delete_kyoto_ess();
		Delete_kyoto_bousai();
	}else{
		/*
		document.getElementById("slideBox1").style.display="block";
		document.getElementById("slideBox2").style.display="block";
		document.getElementById("slideBox3").style.display="block";
		document.getElementById("slideBox4").style.display="block";
		document.getElementById("slideBox5").style.display="block";
		document.getElementById("slideBox6").style.display="block";
		document.getElementById("slideBox7").style.display="block";
		document.getElementById("slideBox8").style.display="block";
		document.getElementById("slideBox9").style.display="block";
		document.getElementById("kankou_slideBox1").style.display="none";
		document.getElementById("kankou_slideBox9").style.display="none";
		*/
	}
	Clear_kml();
	Read_kml();
	$("#slideBox9").slideUp("slow");
	$("#kankou_slideBox9").slideUp("slow");
	$("#slideBox_menu").slideToggle("slow");
	$("#kankou_slideBox_menu").slideToggle("slow");
	/*
	*/
}
