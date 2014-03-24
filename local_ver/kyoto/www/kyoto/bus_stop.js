// jsonデータを取得
var kyoto_bus_stop_json;
var kyoto_bus_stop_markers = new Array();

//var	last_time;
function Get_kyoto_bus_stop_json_data() {
	/*
	setTimeout後に連続して何度もこの関数が呼ばれているようなので、
	1.5秒以内の場合はスキップする暫定対処
	var current_time = Date.now();
	if(current_time <= last_time + 3000){ return;}
	last_time = current_time;
	*/


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


	var url = "http://pingineer.net/cgi-bin/flood-map_kyoto/bus_stop.cgi?"
		+ "lat=" + map.getCenter().lat()
		+ "&lon=" + map.getCenter().lng()
		+ "&radius=" + radius;
	//console.log(url);

	kyoto_bus_stop_json = new XMLHttpRequest();
	kyoto_bus_stop_json.onload = Parse_kyoto_bus_stop_json;
	kyoto_bus_stop_json.open("GET",url,true);
	kyoto_bus_stop_json.send(null);
}


function Parse_kyoto_bus_stop_json() {
	var obj = JSON.parse(kyoto_bus_stop_json.responseText);
	//console.log(obj.places[0]);
	//console.log(obj.places.length);

	for(var i=0; i<obj.places.length; i++){
		var j =0;
		var name_flg =0;
		var lat,lon,name,address,tel,post_code,info;
		for(var key1 in obj.places[i]){
			for(var key2 in obj.places[i][key1]){
				for(var key3 in obj.places[i][key1][key2]){
					//console.log(obj.places[i][key1][key2][key3]);
					if(j==0 && obj.places[i][key1][key2][key3]["lang"] == "JA"){
						name = obj.places[i][key1][key2][key3]["value"];
						name_flg =1;	
					}
					if(j==1 && obj.places[i][key1][key2][key3]["lang"] == "JA" && name_flg ==0){
						name = obj.places[i][key1][key2][key3]["value"];
						name_flg =1;	
					}
					if(j==2 && obj.places[i][key1][key2][key3]["lang"] == "JA" && name_flg ==0){
						name = obj.places[i][key1][key2][key3]["value"];
					}
			
					j++;

					if(obj.places[i][key1][key2][key3]["datatype"] == "http://www.opengis.net/ont/geosparql#wktLiteral"){
						var tmp = obj.places[i][key1][key2][key3]["value"].replace("Point(","");
						tmp = tmp.replace(")","");
						var array = new Array();
						array =tmp.split(" ");
						lon=array[0];
						lat=array[1];
					}


				}
			}
		}
		//console.log("" + lat + lon +name+address+tel+post_code,info);
		// 京都の避難所用のmarkerとinfoWindowの作成		
		Make_kyoto_bus_stop(lat,lon,name,address,tel,post_code,info);
	}


	// 画面外のmarker等は消す
	Delete_kyoto_bus_stop();
}


// 使っていない
// 型判定
function is(type, obj) {
	var clas = Object.prototype.toString.call(obj).slice(8, -1);
	return obj !== undefined && obj !== null && clas === type;
}


function Delete_kyoto_bus_stop() {
	//console.log(kyoto_bus_stop_markers.length);
	// 画面外のmarker等は消す
	for(var i=0; i<kyoto_bus_stop_markers.length; i++){
		if(kyoto_bus_stop_markers[i].ext.keep_flg == 1){
			// keep_flgが1なら0に戻して次の処理に備える
			kyoto_bus_stop_markers[i].ext.keep_flg = 0;
		} else {
			// keep_flgが0ならmarkerの配列等を削除
			delete kyoto_bus_stop_markers[i].ext;
			kyoto_bus_stop_markers[i].setMap(null);
			kyoto_bus_stop_markers.splice(i,1);
			i--;
		}
	}
}


// 京都の避難所用Markerの作成
function Make_kyoto_bus_stop(lat, lng, name, address,tel,post_code,info) {
	// 同じIDのmarkerがあればスキップ
	for(var i =0; i<kyoto_bus_stop_markers.length; i++){
		if(kyoto_bus_stop_markers[i].ext.name == name){
			kyoto_bus_stop_markers[i].ext.keep_flg =1;
			return;
		}
	}



	var myLatlng = new google.maps.LatLng(lat,lng);
	var marker = new google.maps.Marker({
		position: myLatlng,
		map: map,
		icon: "http://maps.google.co.jp/mapfiles/ms/icons/bus.png",
		title:name
	});


	// 作成したmarkerを配列にコピー
	// 直接入れるmarkerを作るとclick eventがなぜか上手く取れないため
	var i = kyoto_bus_stop_markers.length;
	kyoto_bus_stop_markers[i] = marker;
	delete marker;
	kyoto_bus_stop_markers[i].ext=new const_bus_stop(name,address,tel,post_code,info,1);



	// infoWindow内のテキスト
	//var info = "ここからバスに乗る"
	//var info = "<div id='infowindowclass'><button type='button' onclick='change_bus_stop(\"" + myLatlng + "\");'>ここに避難する</button><hr>\n"
	var info = "<div id='bus_stop'><button type='button' onclick='change_destination(\"" + myLatlng + "\");'>ここからバスに乗る</button><hr>\n"
		+ kyoto_bus_stop_markers[i].ext.name + "<BR>\n";
		/*
	if(kyoto_bus_stop_markers[i].ext.tel){
		info =info + "Tel:" + kyoto_bus_stop_markers[i].ext.tel;
	}
	info = info + "<BR><BR>\n"
		+ kyoto_bus_stop_markers[i].ext.info + "</div>";
		+ "住所:" + kyoto_bus_stop_markers[i].ext.post_code + "<BR>\n"
		+ kyoto_bus_stop_markers[i].ext.address + "<BR>\n"
		//+ "Tel:" + kyoto_bus_stop_markers[i].ext.tel + "</div>\n";
		+ "Tel:" + kyoto_bus_stop_markers[i].ext.tel;
		*/


	
	// markerクリックでinfoWindow表示
	google.maps.event.addListener(kyoto_bus_stop_markers[i], 'click', function() {
	var infoWindow = new google.maps.InfoWindow();
		infoWindow.setContent(info);
		infoWindow.setPosition(myLatlng);
		infoWindow.open(map);

		// markerを一旦非表示
		//kyoto_bus_stop_markers[i].setVisible(false);
	});

}

function const_bus_stop(name,address,tel,post_code,info,keep_flg){
	this.name = name;
	this.address = address;
	this.tel = tel;
	this.post_code = post_code;
	this.info = info;
	this.keep_flg = keep_flg;
}
