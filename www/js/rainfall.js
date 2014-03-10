var rainfall_markers = new Array();
var rainfall_sum_markers = new Array();
var rainfall_json;

// rainfallのjsonデータを取得
function Get_rainfall_data(west,north,east,south) {
	var url = "/cgi-bin/hazard_map/rainfall.cgi?"
		+ "west=" + west
		+ "&north=" + north
		+ "&east=" + east
		+ "&south=" + south;

	rainfall_json = new XMLHttpRequest();
	rainfall_json.onload = Parse_rainfall_json;
	rainfall_json.open("GET",url,true);
	rainfall_json.send(null);
}


function Parse_rainfall_json() {
	var obj = JSON.parse(rainfall_json.responseText);
	// rainfallの数だけループを回す
	//console.log(obj.hits.hits.length);
	for(var i =0; i<obj.hits.hits.length; i++){
		//console.log(obj.hits.hits[i]._source.rainfall);

		// rainfall用のmarkerとinfoWindowの作成		
		Make_rainfall(
			obj.hits.hits[i]._source.geometry.coordinates[1],
			obj.hits.hits[i]._source.geometry.coordinates[0],
			obj.hits.hits[i]._id,
			obj.hits.hits[i]._source.properties.Name,
			obj.hits.hits[i]._source.properties.address,
			obj.hits.hits[i]._source.properties.url,
			obj.hits.hits[i]._source.properties.count,
			obj.hits.hits[i]._type
		);
	}
	Delete_rainfall_markers(rainfall_markers);
	Delete_rainfall_markers(rainfall_sum_markers);
}



// 画面外に出たmarkerを消す
function Delete_rainfall_markers(array) {
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


// rainfall用のMarkerの作成
function Make_rainfall(lat, lng, id, name, address,url,count,type) {
	if(type=="rainfall"){
		var array = rainfall_markers;
		var icon="image/rainfall.png";
		var info = "<div id='rainfall_window_class'>"
			+ "<object style='height:100%;width:100%;' data='"
			//+ url.replace("http://www.river.go.jp/","http://153.121.40.227/river/html/full/")
			+  url.replace("http://www.river.go.jp/nrpc0304gDisp.do","http://pingineer.net/cgi-bin/hazard_map/info/rainfall.cgi")
			+ "'>表示できませんでした</object></div>";
		//var info = url.replace("http://www.river.go.jp/","http://153.121.40.227/river/html/full/");
		//var info = url.replace("http://www.river.go.jp/nrpc0304gDisp.do","http://pingineer.net/cgi-bin/hazard_map/info/rainfall.cgi");
	//	var modefy_url = url.replace("http://www.river.go.jp/nrpc0304gDisp.do","http://pingineer.net/cgi-bin/hazard_map/info/rainfall.cgi");


		// db側のurlが60分間隔固定になってしまっているので、更新間隔のドロップダウンで選んだ間隔に差し替える
		if($("select[name=water_level_select]").val() == 10){
			url = url.replace("timeAxis=60","timeAxis=10");
		}
	} else{
		var array = rainfall_sum_markers;
		var icon="image/rainfall_sum.png";
		var info = "<div id='rainfall_sum_window_class'>"
			+ "<a href=\"" + url + "\">"
			+ name + "</a><br>"
			+ "観測所数：" + count
			+ "</div>";
	}

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
		title:name
	});


	// 作成したmarkerを配列にコピー
	// 直接入れるmarkerを作るとclick eventがなぜか上手く取れないため
	var i = array.length;
	array[i] = marker;
	delete marker;
	array[i].ext=new const_rainfall(id,name,address,url,1);
	//array[i].ext=new const_rainfall(id,name,address,modefy_url,1);



/*
	// infoWindow内のテキスト
	var info = "<a href=\"" + rainfall_markers[i].ext.url + "\">"
		 +  rainfall_markers[i].ext.name + "</a>";

	// addressがnull出ない場合は住所を表示
	if(rainfall_markers[i].ext.address !=null){
		info = info + "<br>\n"
			+  "住所:" + rainfall_markers[i].ext.address;
	}
*/

		


	
	// markerクリックでinfoWindow表示
	// infoWindowを配列にして動的に追加・削除すると上手く動かないのでこれで逃げる
	// 多分markerと違い非表示状態のinfoWindowを追加・削除しようとして不具合を生じさせていると予想
	google.maps.event.addListener(array[i], 'click', function() {
		//if(modefy_url){
		//	Get_rainfall_http_data(modefy_url,myLatlng);
		//} else {
			var infoWindow = new google.maps.InfoWindow();
			infoWindow.setContent(info);
			infoWindow.setPosition(myLatlng);
			infoWindow.open(map);
		//}
		// markerを一旦非表示
		//rainfall_markers[i].setVisible(false);
	});

	/* infoWindowを配列化しなくなって特定のmarkerを戻せないのでコメントアウト
	// infowindowの×ボタンを押された際に発火されるイベント
	// 但し、スクリプト内からinfowindowをcloseした場合には発火されない。
	google.maps.event.addListener(infoWindow, 'closeclick', function(){
		//閉じた場合の処理を記載
		// markerを再表示
		rainfall_markers[i].setVisible(true);
	});
	*/
}


function const_rainfall(id,name,address,url,keep_flg){
	this.id = id;
	this.name = name;
	this.address = address;
	this.url = url;
	this.keep_flg = keep_flg;
}

function Get_rainfall_http_data(url,myLatlng) {
	var request = new XMLHttpRequest();
	request.open('GET', url, false);
	request.send();

	if (request.status === 200) {
		var info = request.responseText;
		info = '<div id="rainfall_window_class">' + info + "</div>";
		var infoWindow = new google.maps.InfoWindow();
		infoWindow.setContent(info);
		infoWindow.setPosition(myLatlng);
		infoWindow.open(map);
	}

}
