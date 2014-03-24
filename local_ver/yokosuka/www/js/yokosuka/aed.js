var aed_markers = new Array();
//var aed_infoWindows = new Array();
var aed_json;

// floodのjsonデータを取得
function Get_aed_data(west,north,east,south) {
	//var url = "json/aed.geojson";
	var url = "http://yokosuka-opendata.ubin.jp/dataset/f68f465e-f1c0-45b8-a593-86bc327680a5/resource/54b98e21-ec78-4925-ae80-c5b8204a1674/download/aed.geojson";

	aed_json = new XMLHttpRequest();
	aed_json.onload = Parse_aed_json;
	aed_json.open("GET",url,true);
	aed_json.send(null);
}

// 取得したaedのjsonデータをパースしてmarker等を作成
function Parse_aed_json() {

	var obj = JSON.parse(aed_json.responseText);
	// aedの数だけループを回す
	for(var i =0; i<obj.features.length; i++){

		// aed用のmarkerとinfoWindowの作成		
		Make_aed(
			obj.features[i].geometry.coordinates[1],
			obj.features[i].geometry.coordinates[0],
			obj.features[i].properties.USERID,
			obj.features[i].properties.NAME,
			obj.features[i].properties.ADDRESS,
			obj.features[i].properties.TEL,
			obj.features[i].properties.FAX,
			obj.features[i].properties.URL,
			obj.features[i].properties.INFO
		);

	}
	//Delete_aed_markers(aed_markers);
}


function Delete_aed_markers(aed_markers) {
	var array = aed_markers;
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


// aed用のMarkerの作成
function Make_aed(lat, lng, id, name, address, tel, fax, url, info) {
/*
	// 同じIDのmarkerがあればスキップ
	for(var i =0; i<aed_markers.length; i++){
		if(aed_markers[i].ext.id == id){
			aed_markers[i].ext.keep_flg =1;
			return;
		}
	}
*/

	var myLatlng = new google.maps.LatLng(lat,lng);
	var marker = new google.maps.Marker({
		position: myLatlng,
		map: map,
		icon: "http://maps.google.com/mapfiles/ms/micons/earthquake.png",
		title:name
	});


	// 作成したmarkerを配列にコピー
	// 直接入れるmarkerを作るとclick eventがなぜか上手く取れないため
	var i = aed_markers.length;
	aed_markers[i] = marker;
	delete marker;
	aed_markers[i].ext=new const_aed(id,name,address,tel,fax,url,info);



	// infoWindow内のテキスト
	var info='<div id="aed_infowindow_class">'
		+ '<button type="button" onclick="change_shelter('
		+ lat + "," + lng +  ');">select</button><hr>';
	//var info="";
	if(aed_markers[i].ext.url != null){
		info = info + 'AED設置場所:<a href="' + aed_markers[i].ext.url + '">'
			 +  aed_markers[i].ext.name + "</a>";
	} else {
		info = info + "AED設置場所:" + aed_markers[i].ext.name;
	}
	// addressがnull出ない場合は住所を表示
	if(aed_markers[i].ext.address !=null){
		info = info + "<br>\n"
			+  "住所:" + aed_markers[i].ext.address;
	}
	if(aed_markers[i].ext.tel !=null){
		info = info + "<br>\n"
			+  "TEL:" + aed_markers[i].ext.tel;
	}
	if(aed_markers[i].ext.fax !=null){
		info = info + "<br>\n"
			+  "FAX:" + aed_markers[i].ext.fax;
	}
	if(aed_markers[i].ext.info !=null){
		info = info + "<HR>\n"
			+ aed_markers[i].ext.info;
	}
	info = info + "</div>";


	
	// markerクリックでinfoWindow表示
	google.maps.event.addListener(aed_markers[i], 'click', function() {
	var infoWindow = new google.maps.InfoWindow();
		infoWindow.setContent(info);
		infoWindow.setPosition(myLatlng);
		infoWindow.open(map);

		// markerを一旦非表示
		//aed_markers[i].setVisible(false);
	});

	/*
	// infowindowの×ボタンを押された際に発火されるイベント
	// 但し、スクリプト内からinfowindowをcloseした場合には発火されない。
	google.maps.event.addListener(infoWindow, 'closeclick', function(){
		//閉じた場合の処理を記載
		// markerを再表示
		aed_markers[i].setVisible(true);
	});
	*/
}

function const_aed(id,name,address,tel,fax,url,info){
	this.id = id;
	this.name = name;
	this.address = address;
	this.tel = tel;
	this.fax = fax;
	this.url = url;
	this.info = info;
}
