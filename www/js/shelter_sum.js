var hinanjyo_layer;

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
  });
}


// 避難所のmarkerをクリックしたらinfoWindowを表示
function showInContentWindow(map, position, text) {
  //var content = "<div style='margin-left:20px;border:2px dotted #897823;'>" + text +  "</div>";
  //content = content + "<br><div id='infowindowclass'>ここを避難所にする</div>";
  //var content = "<div id='infowindowclass'>" + text + "</div>";
  //var content = "<div id='infowindowclass'>" + text;
  //var content = "<div id='infowindowclass'><button type='button' onclick='change_shelter(\"" + position + "\");'>ここに避難する</button><hr>" + text + "</div>";
  //var content = "<div id='shelter_infowindow_class'><button type='button' onclick='change_shelter(\"" + position + "\");'>ここに避難する</button><hr>" + text + "</div>";
  var content = '<div id="shelter_infowindow_class">' + text + "</div>";
  var infowindow = new google.maps.InfoWindow({
    content: content,
    position: position
  })
  infowindow.open(map);
}

