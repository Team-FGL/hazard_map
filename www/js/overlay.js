var rainfall_overlay_layer;

function Read_rainfall_overlay_kml() {
	//KMLファイルの読み込み
	// rainfall_overlay map
	var kmlUrl = "http://pingineer.net/cgi-bin/flood-map/rainfall_overlay.cgi?north=" + map.getBounds().getNorthEast().lat()
		+ "&east=" + map.getBounds().getNorthEast().lng()
		+ "&south=" + map.getBounds().getSouthWest().lat()
		+ "&west=" + map.getBounds().getSouthWest().lng();
	rainfall_overlay_layer = new google.maps.KmlLayer(kmlUrl, {
		preserveViewport:true,
		suppressInfoWindows: true
	});
	rainfall_overlay_layer.setMap(map);
}
