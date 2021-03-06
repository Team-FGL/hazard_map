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
var current_latlng,shelter_latlng;

$(function(){
     $(".open_menu").click(function(){
      $("#slideBox_menu").slideToggle("slow");
     });
});

$(function(){
     $(".open1").click(function(){
      $("#slideBox1").slideToggle("slow");
     });
});

$(function(){
     $(".open2").click(function(){
      $("#slideBox2").slideToggle("slow");
     });
});

$(function(){
     $(".open3").click(function(){
      $("#slideBox3").slideToggle("slow");
     });
});

$(function(){
     $(".open4").click(function(){
      $("#slideBox4").slideToggle("slow");
     });
});

$(function(){
     $(".open5").click(function(){
      $("#slideBox5").slideToggle("slow");
     });
});

$(function(){
     $(".open6").click(function(){
      $("#slideBox6").slideToggle("slow");
     });
});

$(function(){
     $(".open7").click(function(){
      $("#slideBox7").slideToggle("slow");
     });
});

$(function(){
     $(".open8").click(function(){
      $("#slideBox8").slideToggle("slow");
     });
});

$(function() {
	$("#help_open").click(function() {
		$("#overlay_help").fadeIn();　/*ふわっと表示*/
	});
	$("#help_close").click(function() {
		$("#overlay_help").fadeOut();　/*ふわっと消える*/
	});
});

function initialize() {

	directionsDisplay = new google.maps.DirectionsRenderer();
	//var initPos = new google.maps.LatLng(35.247924,139.687761);
	//var initPos = new google.maps.LatLng(34.688241,135.229200);
	var initPos = new google.maps.LatLng(35.619078,134.429391);
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
	} else {
		getCurrentLocation();
	}


	// 画面の中心が変わったらkmlファイルの再取得と再ロード
  google.maps.event.addListener(map, 'center_changed', function() {
    // 3 seconds after the center of the map has changed, rewrite kml layer.
    window.setTimeout(function() {
			flood_map_layer.setMap(null);
			hinanjyo_layer.setMap(null);
			if(water_level_layer){water_level_layer.setMap(null);}
			if(water_level_overlay_layer){water_level_overlay_layer.setMap(null);}
			if(livecam_layer){livecam_layer.setMap(null);}
			if(landslide_layer){landslide_layer.setMap(null);}
			if(rainfall_layer){rainfall_layer.setMap(null);}
			if(rainfall_overlay_layer){rainfall_overlay_layer.setMap(null);}
			//Read_kml(map);
			Read_kml();
    }, 3000);
  });

	// zoomが変わったらkmlファイルの再取得と再ロード
  google.maps.event.addListener(map, 'zoom_changed', function() {
    window.setTimeout(function() {
			flood_map_layer.setMap(null);
			hinanjyo_layer.setMap(null);
			if(water_level_layer){water_level_layer.setMap(null);}
			if(water_level_overlay_layer){water_level_overlay_layer.setMap(null);}
			if(livecam_layer){livecam_layer.setMap(null);}
			if(landslide_layer){landslide_layer.setMap(null);}
			if(rainfall_layer){rainfall_layer.setMap(null);}
			if(rainfall_overlay_layer){rainfall_overlay_layer.setMap(null);}
			//Read_kml(map);
			Read_kml();
    }, 3000);
  });

	Main_loop();

}


function Read_kml() {
	// window.setTimeoutの秒数後、何度もこの関数が呼ばれているようなので3秒以内の変化はスキップするよう暫定対処
//	var current_time = Date.now();
//	if(current_time <= last_time + 3000){ return; }
//	last_time = Date.now();

	Read_flood_kml();
	Read_shelter_kml();
	Read_water_level_kml();
	Read_water_level_overlay_kml();
	Read_livecam_kml();
	Read_landslide_kml();
	Read_rainfall_kml();
	Read_rainfall_overlay_kml();
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


// 避難経路再計算
function calcRoute() {
  var start = document.getElementById('current').value;
  var end = document.getElementById('shelter').value;
	if(current_latlng){start=current_latlng;}
	if(shelter_latlng){end=shelter_latlng;}

  var request = {
      origin:start,
      destination:end,
      travelMode: google.maps.TravelMode.DRIVING
  };
  directionsService.route(request, function(response, status) {
    if (status == google.maps.DirectionsStatus.OK) {
      directionsDisplay.setDirections(response);
    }
  });
}


// 使ってない
function GetGeoLocation(){
  if (navigator.geolocation) {

    // 現在の位置情報を取得
    navigator.geolocation.getCurrentPosition(

      // （1）位置情報の取得に成功した場合
      function (pos) {
        var location ="<li>"+"緯度：" + pos.coords.latitude + "</li>";
        location += "<li>"+"経度：" + pos.coords.longitude + "</li>";
        document.getElementById("location").value = location;
      },
      // （2）位置情報の取得に失敗した場合
      function (error) {
        var message = "";

        switch (error.code) {

          // 位置情報が取得できない場合
          case error.POSITION_UNAVAILABLE:
            message = "位置情報の取得ができませんでした。";
            break;

          // Geolocationの使用が許可されない場合
          case error.PERMISSION_DENIED:
            message = "位置情報取得の使用許可がされませんでした。";
            break;

          // タイムアウトした場合
          case error.PERMISSION_DENIED_TIMEOUT:
            message = "位置情報取得中にタイムアウトしました。";
            break;
        }
        window.alert(message);
      }
    );
  } else {
    window.alert("本ブラウザではGeolocationが使えません");
  }
}

// 「ここへ避難」ボタンを押したときの処理
function change_shelter(latlng) {
	var tmp_latlng = latlng.split(",")
	var lat = tmp_latlng[0].replace("(","");
	var lng = tmp_latlng[1].replace(")","");
	shelter_latlng= lat + "," + lng;
	getAddress(lat,lng, "shelter");
}


// 座標から住所へ変換
function getAddress(lat,lng, id) {
	var latlng = new google.maps.LatLng(lat,lng);
  var geocoder = new google.maps.Geocoder();
  geocoder.geocode({
    //latLng: latlng
    location: latlng
  }, function(results, status) {
    if (status == google.maps.GeocoderStatus.OK) {
      if (results[0].geometry) {

          var address = results[0].formatted_address.replace(/^日本, /, '');
					document.getElementById(id).value = address;
					calcRoute();
      }
    } else if (status == google.maps.GeocoderStatus.ERROR) {
      alert("server connection error");
    } else if (status == google.maps.GeocoderStatus.INVALID_REQUEST) {
      alert("latlng error");
    } else if (status == google.maps.GeocoderStatus.OVER_QUERY_LIMIT) {
      alert("too much quary");
    } else if (status == google.maps.GeocoderStatus.REQUEST_DENIED) {
      alert("can't use geocoder");
    } else if (status == google.maps.GeocoderStatus.UNKNOWN_ERROR) {
      alert("server error");
    } else if (status == google.maps.GeocoderStatus.ZERO_RESULTS) {
      alert("not found");
    } else {
      alert("geocoder error");
    }
  });
}

// 位置情報の取得
function getCurrentLocation() {
	// geo locationの取得
	navigator.geolocation.getCurrentPosition(
		// （1）位置情報の取得に成功した場合
		function (pos) {
			//if($("input[name=center-position]:checked").val()==1){
			//	map.panTo(new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude));
			//}
			current_latlng=pos.coords.latitude + "," + pos.coords.longitude;
			map.panTo(new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude));
			getAddress(pos.coords.latitude, pos.coords.longitude, "current");
	});
}

function Disp_center_position(text_id) {
	if($("input[name=center-position]:checked").val()==1){
		Get_latlng_from_address(text_id);
	}
}

// 住所や名称等から座標を取得
function Get_latlng_from_address(text_id) {
	var place =document.getElementById(text_id).value;
	var geocoder = new google.maps.Geocoder();

	geocoder.geocode({
		address: place
		}, function(results, status) {
			if (status == google.maps.GeocoderStatus.OK) {
				var bounds = new google.maps.LatLngBounds();
				// 結果は配列で来る
				//for (var i in results) {
				//	if (results[i].geometry) {
				//		var latlng = results[i].geometry.location;
				//		var address = results[i].formatted_address.replace(/^日本, /, '');
				//	}
				//}

				// 面倒なので検索最上位へpan
				map.panTo(results[0].geometry.location);

			} else if (status == google.maps.GeocoderStatus.ERROR) {
				alert("connection error");
			} else if (status == google.maps.GeocoderStatus.INVALID_REQUEST) {
				alert("requst string error");
			} else if (status == google.maps.GeocoderStatus.OVER_QUERY_LIMIT) {
				alert("too mach quary");
			} else if (status == google.maps.GeocoderStatus.REQUEST_DENIED) {
				alert("can't use geocode");
			} else if (status == google.maps.GeocoderStatus.UNKNOWN_ERROR) {
				alert("server error");
			} else if (status == google.maps.GeocoderStatus.ZERO_RESULTS) {
				alert("not found");
			} else {
				alert("error");
			}
	});
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

function Genzai_change(value) {
    var geocoder = new google.maps.Geocoder();
    var address = document.getElementById("genzai").value;

    geocoder.geocode( { 'address': address}, function(results, status) {
      if (status == google.maps.GeocoderStatus.OK) {
          map.setCenter(results[0].geometry.location);
      } else if (status == google.maps.GeocoderStatus.ERROR) {
	  alert("server connection error");
      } else if (status == google.maps.GeocoderStatus.INVALID_REQUEST) {
	  alert("latlng error");
      } else if (status == google.maps.GeocoderStatus.OVER_QUERY_LIMIT) {
	  alert("too much quary");
      } else if (status == google.maps.GeocoderStatus.REQUEST_DENIED) {
	  alert("can't use geocoder");
      } else if (status == google.maps.GeocoderStatus.UNKNOWN_ERROR) {
	  alert("server error");
      } else if (status == google.maps.GeocoderStatus.ZERO_RESULTS) {
	  alert("not found");
      } else {
	  alert("geocoder error");
      }
    });    

}

function Main_loop() {
	if($("input[name=center-position]:checked").val()!=1){ return; }
	getCurrentLocation();
	window.setTimeout(function() {
		Main_loop();
	}, 15000);
}
