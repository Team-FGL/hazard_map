var shelter_markers = new Array();
var shelter_sum_markers = new Array();
var shelter_json;

// shelterのjsonデータを取得
function Get_shelter_data(west,north,east,south) {
	var p20_007=0,p20_008=0,p20_009=0,p20_010=0,p20_011=0,p20_012=0;
	if($("input[name=p20_007]:checked").val()==1){p20_007=1;}
	if($("input[name=p20_008]:checked").val()==1){p20_008=1;}
	if($("input[name=p20_009]:checked").val()==1){p20_009=1;}
	if($("input[name=p20_010]:checked").val()==1){p20_010=1;}
	if($("input[name=p20_011]:checked").val()==1){p20_011=1;}
	if($("input[name=p20_012]:checked").val()==1){p20_012=1;}
	if(p20_007==0 & p20_008==0 & p20_009==0 & p20_010==0 & p20_011==0 & p20_012==0){
		Delete_shelter_markers(shelter_markers);
		return;
	}

	var url = "http://pingineer.net/cgi-bin/hazard_map/shelter.cgi?"
		+ "west=" + west
		+ "&north=" + north
		+ "&east=" + east
		+ "&south=" + south
		+ "&p20_007=" + p20_007
		+ "&p20_008=" + p20_008
		+ "&p20_009=" + p20_009
		+ "&p20_010=" + p20_010
		+ "&p20_011=" + p20_011
		+ "&p20_012=" + p20_012;

	//console.log(url);

	shelter_json = new XMLHttpRequest();
	shelter_json.onload = Parse_shelter_json;
	shelter_json.open("GET",url,true);
	shelter_json.send(null);
}


function Parse_shelter_json() {
	var obj = JSON.parse(shelter_json.responseText);

	if(hinanjyo_layer){hinanjyo_layer.setMap(null);}
	// 数が多い時は都道府県ごとにまとめる
	if(obj.hits.hits.length>=2500){
		Delete_shelter_markers(shelter_markers);
		Read_shelter_kml();
		return;
	}


	// shelterの数だけループを回す
	//console.log(obj.hits.hits.length);
	for(var i =0; i<obj.hits.hits.length; i++){
		//console.log(obj.hits.hits[i]._source);

		// shelter用のmarkerとinfoWindowの作成		
		Make_shelter(
			obj.hits.hits[i]._source.geometry.coordinates[1],
			obj.hits.hits[i]._source.geometry.coordinates[0],
			obj.hits.hits[i]._id,
			obj.hits.hits[i]._source.properties.P20_002,
			obj.hits.hits[i]._source.properties.P20_003,
			obj.hits.hits[i]._source.properties.P20_004,
			obj.hits.hits[i]._source.properties.P20_007,
			obj.hits.hits[i]._source.properties.P20_008,
			obj.hits.hits[i]._source.properties.P20_009,
			obj.hits.hits[i]._source.properties.P20_010,
			obj.hits.hits[i]._source.properties.P20_011,
			obj.hits.hits[i]._source.properties.P20_012
		);
	}
	Delete_shelter_markers(shelter_markers);
	//Delete_shelter_markers(shelter_sum_markers);
}



// 画面外に出たmarkerを消す
function Delete_shelter_markers(array) {
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

/*
// 選択を外した避難所を消す
function Delete_unselected_shelter_markers(array,spec) {
	for(var i=0; i<array.length; i++){
		if(array[i].ext[spec] == 1){
			// keep_flgが0ならmarkerの配列等を削除
			delete array[i].ext;
			array[i].setMap(null);
			array.splice(i,1);
			i--;
		}
	}
}
*/


// shelter用のMarkerの作成
function Make_shelter(lat, lng, id, name, address,type,p20_007,p20_008,p20_009,p20_010,p20_011,p20_012) {
	var array = shelter_markers;

	// 同じIDのmarkerがあればスキップ
	for(var i =0; i<array.length; i++){
		if(array[i].ext.id == id){
			array[i].ext.keep_flg =1;
			return;
		}
	}

	var icon="image/shelter.png";
	var info = '<div id="shelter_infowindow_class">'
		+ '<button type="button" onclick=change_shelter('
		 + lat + "," + lng +  ');>select</button><hr>'
		+ "<object style='height:100%;width:100%;' data='"
		//+ Make_shelter_info_url(lat,lng,name,address,type,p20_007,p20_008,p20_009,p20_010,p20_011,p20_012)
		+ Make_shelter_info_url(name,address,type,p20_007,p20_008,p20_009,p20_010,p20_011,p20_012)
		+ "'>表示できませんでした</object></div>";
/*
	var info=Make_shelter_info(
		lat,lng,name, address, type,
		p20_007, p20_008, p20_009,
		p20_010, p20_011, p20_012
	);
 var url=Make_shelter_info_url(lat,lng,name,address,type,p20_007,p20_008,p20_009,p20_010,p20_011,p20_012);
*/

	var myLatlng = new google.maps.LatLng(lat,lng);
	var marker = new google.maps.Marker({
		position: myLatlng,
		map: map,
		icon: icon,
		title:name
	});


	// 作成したmarkerを配列にコピー
	// 直接入れるmarkerを作るとclick eventがなぜか上手く取れないため
	var i = array.length;
	array[i] = marker;
	delete marker;
	array[i].ext=new const_shelter(id,name,address,type,p20_007,p20_008,p20_009,p20_010,p20_011,p20_012,1);



/*
	// infoWindow内のテキスト
	var info = "<a href=\"" + shelter_markers[i].ext.url + "\">"
		 +  shelter_markers[i].ext.name + "</a>";

	// addressがnull出ない場合は住所を表示
	if(shelter_markers[i].ext.address !=null){
		info = info + "<br>\n"
			+  "住所:" + shelter_markers[i].ext.address;
	}
*/

		


	
	// markerクリックでinfoWindow表示
	// infoWindowを配列にして動的に追加・削除すると上手く動かないのでこれで逃げる
	// 多分markerと違い非表示状態のinfoWindowを追加・削除しようとして不具合を生じさせていると予想
	google.maps.event.addListener(array[i], 'click', function() {
			var infoWindow = new google.maps.InfoWindow();
			infoWindow.setContent(info);
			infoWindow.setPosition(myLatlng);
			infoWindow.open(map);
		// markerを一旦非表示
		//shelter_markers[i].setVisible(false);
	});

	/* infoWindowを配列化しなくなって特定のmarkerを戻せないのでコメントアウト
	// infowindowの×ボタンを押された際に発火されるイベント
	// 但し、スクリプト内からinfowindowをcloseした場合には発火されない。
	google.maps.event.addListener(infoWindow, 'closeclick', function(){
		//閉じた場合の処理を記載
		// markerを再表示
		shelter_markers[i].setVisible(true);
	});
	*/
}


function const_shelter(id,name,address,type,p20_007,p20_008,p20_009,p20_010,p20_011,p20_012,keep_flg){
	this.id = id;
	this.name = name;
	this.address = address;
	this.type = type;
	this.p20_007 = p20_007;
	this.p20_008 = p20_008;
	this.p20_009 = p20_009;
	this.p20_010 = p20_010;
	this.p20_011 = p20_011;
	this.p20_012 = p20_012;
	this.keep_flg = keep_flg;
}

/*
function Get_shelter_http_data(url,myLatlng) {
	var request = new XMLHttpRequest();
	request.open('GET', url, false);
	request.send();

	if (request.status === 200) {
		var info = request.responseText;
		info = '<div id="shelter_window_class">' + info + "</div>";
		var infoWindow = new google.maps.InfoWindow();
		infoWindow.setContent(info);
		infoWindow.setPosition(myLatlng);
		infoWindow.open(map);
	}
}

function Make_shelter_info(lat,lng,name,address,type,p20_007,p20_008,p20_009,p20_010,p20_011,p20_012){
	var info = '<div id="shelter_infowindow">'
		+ '<button type="button" onclick=change_shelter('
		 + lat + "," + lng +  ');>ここに避難する</button><hr>'
		+ '<table style="font-size:8pt;">'
			+ '<tr><th>名称</th><td>' + name + '</td></tr>'
			+ '<tr><th>住所</th><td>' + address + '</td></tr>'
			+ '<tr><th>施設の種類</th><td>' + type + '</td></tr>'
		+ '</table>'
		+ '<br>'
		+ '<table style="font-size:8pt;">'
			+ '<tr><th colspan="2">災害分類</th></tr>'
			+ '<tr><th>地震災害</th><td>' + Check_shelter_spec(p20_007) + '</td></tr>'
			+ '<tr><th>津波災害</th><td>' + Check_shelter_spec(p20_008) + '</td></tr>'
			+ '<tr><th>水害</th><td>' + Check_shelter_spec(p20_009) + '</td></tr>'
			+ '<tr><th>火災災害</th><td>' + Check_shelter_spec(p20_010) + '</td></tr>'
			+ '<tr><th>その他</th><td>' + Check_shelter_spec(p20_011) + '</td></tr>'
			+ '<tr><th>指定なし</th><td>' + Check_shelter_spec(p20_012) + '</td></tr>'
		+ '</table>'
		+ "</div>";

	//console.log(info);
	return info;
}

function Check_shelter_spec(spec){
	if(spec==0){
		return "×";
	} else {
		return "○";
	}
}
*/

//function Make_shelter_info_url(lat,lng,name,address,type,p20_007,p20_008,p20_009,p20_010,p20_011,p20_012){
function Make_shelter_info_url(name,address,type,p20_007,p20_008,p20_009,p20_010,p20_011,p20_012){
	var url = 'http://pingineer.net/cgi-bin/hazard_map/info/shelter.cgi?'
//		+ 'lat=' +  lat
//		+ '&lng=' +  lng
		+ '&name="' + name + '"'
		+ '&address="' + address + '"'
		+ '&type="' + type + '"'
		+ '&p20_007=' + p20_007
		+ '&p20_008=' + p20_008
		+ '&p20_009=' + p20_009
		+ '&p20_010=' + p20_010
		+ '&p20_011=' + p20_011
		+ '&p20_012=' + p20_012;

	//console.log(url);
	return url;
}
