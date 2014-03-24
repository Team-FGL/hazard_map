var water_level_overlay_layer;
var rainfall_overlay_layer;


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


