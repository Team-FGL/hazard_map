var live_cam_markers = new Array();
//var live_cam_infoWindows = new Array();
var live_cam_json;

// floodのjsonデータを取得
function Get_live_cam_data(west,north,east,south) {
	var url = "/cgi-bin/hazard_map/live_cam.cgi?"
		+ "west=" + west
		+ "&north=" + north
		+ "&east=" + east
		+ "&south=" + south;

	live_cam_json = new XMLHttpRequest();
	live_cam_json.onload = Parse_live_cam_json;
	//live_cam_json.open("GET","json/live_cam.json",true);
	live_cam_json.open("GET",url,true);
	live_cam_json.send(null);
}

// 取得したlive_camのjsonデータをパースしてmarker等を作成
function Parse_live_cam_json() {

	var obj = JSON.parse(live_cam_json.responseText);
	// live_camの数だけループを回す
	//console.log(obj._source.live_cam[0].location.coordinates);
	for(var i =0; i<obj.hits.hits.length; i++){
		//console.log(obj.hits.hits[i]._source.live_cam);

		// live_cam用のmarkerとinfoWindowの作成		
		Make_live_cam(
			obj.hits.hits[i]._source.geometry.coordinates[1],
			obj.hits.hits[i]._source.geometry.coordinates[0],
			obj.hits.hits[i]._id,
			obj.hits.hits[i]._source.properties.Name,
			obj.hits.hits[i]._source.properties.address,
			obj.hits.hits[i]._source.properties.url,
			obj.hits.hits[i]._source.properties.live_url
		);

	}
	Delete_live_cam_markers(live_cam_markers);
}


function Delete_live_cam_markers(live_cam_markers) {
	var array = live_cam_markers;
	for(var i=0; i<array.length; i++){
		if(array[i].ext.keep_flg == 1){
			// keep_flgが1なら0に戻して次の処理に備える
			array[i].ext.keep_flg = 0;
		} else {
			// keep_flgが0ならmarkerの配列等を削除
			delete array[i].ext;
			array[i].setMap(null);
			array.splice(i,1);
			i--;
		}
	}
}


// live_cam用のMarkerの作成
function Make_live_cam(lat, lng, id, name, address,url,live_url) {
	// 同じIDのmarkerがあればスキップ
	for(var i =0; i<live_cam_markers.length; i++){
		if(live_cam_markers[i].ext.id == id){
			live_cam_markers[i].ext.keep_flg =1;
			return;
		}
	}

	var myLatlng = new google.maps.LatLng(lat,lng);
	var marker = new google.maps.Marker({
		position: myLatlng,
		map: map,
		icon: "image/camera.png",
		title:name
	});


	// 作成したmarkerを配列にコピー
	// 直接入れるmarkerを作るとclick eventがなぜか上手く取れないため
	var i = live_cam_markers.length;
	live_cam_markers[i] = marker;
	delete marker;
	live_cam_markers[i].ext=new const_live_cam(id,name,address,url,live_url,1);



	// infoWindow内のテキスト
	var info = "<a href=\"" + live_cam_markers[i].ext.url + "\">"
		 +  live_cam_markers[i].ext.name + "</a>";
	// addressがnull出ない場合は住所を表示
	if(live_cam_markers[i].ext.address !=null){
		info = info + "<br>\n"
			+  "住所:" + live_cam_markers[i].ext.address;
	}
	
	if(live_cam_markers[i].ext.live_url !=null){
		info = "<div style='height:550px;width:550px;'>"
			+ info + "<br>\n"
			+ "<object style='height:90%;width:95%;' data='"
			+ live_cam_markers[i].ext.live_url
			+ "'>表示できませんでした</object></div>";
	}



	
	// markerクリックでinfoWindow表示
	google.maps.event.addListener(live_cam_markers[i], 'click', function() {
	var infoWindow = new google.maps.InfoWindow();
		infoWindow.setContent(info);
		infoWindow.setPosition(myLatlng);
		infoWindow.open(map);

		// markerを一旦非表示
		//live_cam_markers[i].setVisible(false);
	});

	/*
	// infowindowの×ボタンを押された際に発火されるイベント
	// 但し、スクリプト内からinfowindowをcloseした場合には発火されない。
	google.maps.event.addListener(infoWindow, 'closeclick', function(){
		//閉じた場合の処理を記載
		// markerを再表示
		live_cam_markers[i].setVisible(true);
	});
	*/
}

function const_live_cam(id,name,address,url,live_url,keep_flg){
	this.id = id;
	this.name = name;
	this.address = address;
	this.url = url;
	this.live_url = live_url;
	this.keep_flg = keep_flg;
}
