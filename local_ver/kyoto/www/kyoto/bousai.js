// jsonデータを取得
var kyoto_bousai_json;
var kyoto_bousai_markers = new Array();

//var	last_time;
function Get_kyoto_bousai_json_data() {
	/*
	setTimeout後に連続して何度もこの関数が呼ばれているようなので、
	1.5秒以内の場合はスキップする暫定対処
	var current_time = Date.now();
	if(current_time <= last_time + 3000){ return;}
	last_time = current_time;
	*/

	/*
	// radiusを小数点第一位までで切り上げ
	var x1 = map.getBounds().getNorthEast().lat();
	var y1 = map.getBounds().getNorthEast().lng();
	var x2 = map.getBounds().getSouthWest().lat();
	var y2 = map.getBounds().getSouthWest().lng();
	var r = 6378.137 * 1000;
	// 多分どこか間違ってる
	var radius = r * Math.acos(Math.sin(y1)*Math.sin(y2) + Math.cos(y1)*Math.cos(y2)*Math.cos(x2-x1));
	// 100倍くらい値がおかしいので200で割って半径とする
	//radius = Math.ceil(Math.abs(radius/200));
	// radiusと言いつつ直径?
	radius = Math.ceil(Math.abs(radius/100));
	*/

	var url = "http://pingineer.net/cgi-bin/flood-map_kyoto/bousai.cgi?"
		+ "north=" + map.getBounds().getNorthEast().lat()
		+ "&east=" + map.getBounds().getNorthEast().lng()
		+ "&south=" + map.getBounds().getSouthWest().lat()
		+ "&west=" + map.getBounds().getSouthWest().lng();
	//console.log(url);

	kyoto_bousai_json = new XMLHttpRequest();
	kyoto_bousai_json.onload = Parse_kyoto_bousai_json;
	kyoto_bousai_json.open("GET",url,true);
	kyoto_bousai_json.send(null);
}


function Parse_kyoto_bousai_json() {
	var obj = JSON.parse(kyoto_bousai_json.responseText);
	//console.log(obj.hits.hits);

	for(var i =0; i<obj.hits.hits.length; i++){
		//console.log(obj.hits.hits[i]._source.geometry.coordinates[1]);

		// NTT Com防災実証サイト用のmarkerとinfoWindowの作成
		Make_kyoto_bousai(
			obj.hits.hits[i]._source.geometry.coordinates[1] + 0.00315378,
			obj.hits.hits[i]._source.geometry.coordinates[0] - 0.00283103,
			obj.hits.hits[i]._id,
			obj.hits.hits[i]._source.properties.label,
			obj.hits.hits[i]._source.properties.address,
			obj.hits.hits[i]._source.properties.city_name,
			obj.hits.hits[i]._source.properties.openTarget
		);
	}


	// 画面外のmarker等は消す
	Delete_kyoto_bousai();
}



function Delete_kyoto_bousai() {
	//console.log(kyoto_bousai_markers.length);
	// 画面外のmarker等は消す
	for(var i=0; i<kyoto_bousai_markers.length; i++){
		if(kyoto_bousai_markers[i].ext.keep_flg == 1){
			// keep_flgが1なら0に戻して次の処理に備える
			kyoto_bousai_markers[i].ext.keep_flg = 0;
		} else {
			// keep_flgが0ならmarkerの配列等を削除
			delete kyoto_bousai_markers[i].ext;
			kyoto_bousai_markers[i].setMap(null);
			kyoto_bousai_markers.splice(i,1);
			i--;
		}
	}
}


// 京都の避難所用Markerの作成
function Make_kyoto_bousai(lat, lng,id, name, address,city_name,openTarget) {
//function Make_kyoto_bousai(lat, lng, name, address,tel,post_code) {
	// 同じIDのmarkerがあればスキップ
	for(var i =0; i<kyoto_bousai_markers.length; i++){
		if(kyoto_bousai_markers[i].ext.id == id){
			kyoto_bousai_markers[i].ext.keep_flg =1;
			return;
		}
	}



	var myLatlng = new google.maps.LatLng(lat,lng);
	var marker = new google.maps.Marker({
		position: myLatlng,
		map: map,
		icon: "http://maps.google.co.jp/mapfiles/ms/icons/homegardenbusiness.png",
		title:name
	});


	// 作成したmarkerを配列にコピー
	// 直接入れるmarkerを作るとclick eventがなぜか上手く取れないため
	var i = kyoto_bousai_markers.length;
	kyoto_bousai_markers[i] = marker;
	delete marker;
	kyoto_bousai_markers[i].ext=new const_bousai(id,name,address,city_name,openTarget,1);



	// infoWindow内のテキスト
	//var info = "ここに避難する"
	//var info = "<div id='infowindowclass'><button type='button' onclick='change_bousai(\"" + myLatlng + "\");'>ここに避難する</button><hr>\n"
	var info = "<button type='button' onclick='change_shelter(\"" + myLatlng + "\");'>ここに避難する</button><hr>\n"
		+ kyoto_bousai_markers[i].ext.name + "<BR><BR>"
		+ "住所:" + kyoto_bousai_markers[i].ext.address + "<BR>\n";
	


	
	// markerクリックでinfoWindow表示
	google.maps.event.addListener(kyoto_bousai_markers[i], 'click', function() {
	var infoWindow = new google.maps.InfoWindow();
		infoWindow.setContent(info);
		infoWindow.setPosition(myLatlng);
		infoWindow.open(map);

		// markerを一旦非表示
		//kyoto_bousai_markers[i].setVisible(false);
	});

}

function const_bousai(id,name,address,city_name,openTarget,keep_flg){
	this.id = id;
	this.name = name;
	this.address = address;
	this.city_name = city_name;
	this.openTarget = openTarget;
	this.keep_flg = keep_flg;
}
