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

$(function(){
     $(".open9").click(function(){
      $("#slideBox9").slideToggle("slow");
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


// 「ここへ避難」ボタンを押したときの処理
function change_shelter(lat,lng) {
	shelter_latlng= lat + "," + lng;
	getAddress(lat,lng, "shelter");
}



function Disp_center_position(text_id) {
	if($("input[name=center-position]:checked").val()==1){
		Get_latlng_from_address(text_id);
	}
}



function Flood_level_change(value) {
  if($("input[name=flood-level]:checked").val()!=1){
    Delete_flood_polygons(flood_polygons);
		return;
  }
	//Get_json_data();
  var north = map.getBounds().getNorthEast().lat();
  var east  = map.getBounds().getNorthEast().lng();
  var south = map.getBounds().getSouthWest().lat();
  var west = map.getBounds().getSouthWest().lng();
  depth = $("select[name=flood-level]").val();
	//east = Check_east(east,west);

  Get_flood_data(west,north,east,south,depth);
}

function Shelter_change(value) {
/*
  if($("input[name=p20_007]:checked").val()!=1){
		Delete_unselected_shelter_markers(shelter_markers,"p20_007");
		return;
  }
  if($("input[name=p20_008]:checked").val()!=1){
		Delete_unselected_shelter_markers(shelter_markers,"p20_008");
		return;
  }
  if($("input[name=p20_009]:checked").val()!=1){
		Delete_unselected_shelter_markers(shelter_markers,"p20_009");
		return;
  }
  if($("input[name=p20_010]:checked").val()!=1){
		Delete_unselected_shelter_markers(shelter_markers,"p20_010");
		return;
  }
  if($("input[name=p20_011]:checked").val()!=1){
		Delete_unselected_shelter_markers(shelter_markers,"p20_011");
		return;
  }
  if($("input[name=p20_012]:checked").val()!=1){
		Delete_unselected_shelter_markers(shelter_markers,"p20_012");
		return;
  }
*/
  var north = map.getBounds().getNorthEast().lat();
  var east  = map.getBounds().getNorthEast().lng();
  var south = map.getBounds().getSouthWest().lat();
  var west = map.getBounds().getSouthWest().lng();
	//east = Check_east(east,west);

  Get_shelter_data(west,north,east,south,depth);
}

function Water_level_change(value) {
  if($("input[name=water_level]:checked").val()!=1){
		Delete_water_level_markers(water_level_markers);
		Delete_water_level_markers(water_level_sum_markers);
		return;
  }
	//Get_json_data();
  var north = map.getBounds().getNorthEast().lat();
  var east  = map.getBounds().getNorthEast().lng();
  var south = map.getBounds().getSouthWest().lat();
  var west = map.getBounds().getSouthWest().lng();
	//east = Check_east(east,west);

  Get_water_level_data(west,north,east,south);
}

function Water_level_overlay_change(value) {
	if(water_level_overlay_layer){water_level_overlay_layer.setMap(null);}
	Read_water_level_overlay_kml();
	//Get_json_data();
}

function Livecam_change(value) {
  if($("input[name=livecam]:checked").val()!=1){
		Delete_live_cam_markers(live_cam_markers);
		return;
  }
	//Get_json_data();
  var north = map.getBounds().getNorthEast().lat();
  var east  = map.getBounds().getNorthEast().lng();
  var south = map.getBounds().getSouthWest().lat();
  var west = map.getBounds().getSouthWest().lng();
	//east = Check_east(east,west);

  Get_live_cam_data(west,north,east,south);
}

function Rainfall_change(value) {
  if($("input[name=rainfall]:checked").val()!=1){
		Delete_rainfall_markers(rainfall_markers);
		Delete_rainfall_markers(rainfall_sum_markers);
		return;
  }
	//Get_json_data();
  var north = map.getBounds().getNorthEast().lat();
  var east  = map.getBounds().getNorthEast().lng();
  var south = map.getBounds().getSouthWest().lat();
  var west = map.getBounds().getSouthWest().lng();
	//east = Check_east(east,west);

	Get_rainfall_data(west,north,east,south);
}

function Rainfall_overlay_change(value) {
	if(rainfall_overlay_layer){rainfall_overlay_layer.setMap(null);}
	Read_rainfall_overlay_kml();
	//Get_json_data();
}

function Landslide_change(value) {
  if($("input[name=landslide]:checked").val()!=1){
		Delete_landslide(landslide_polygons);
		Delete_landslide(landslide_markers);
		Delete_landslide(landslide_polylines);
		return;
  }
	//Get_json_data();
  var north = map.getBounds().getNorthEast().lat();
  var east  = map.getBounds().getNorthEast().lng();
  var south = map.getBounds().getSouthWest().lat();
  var west = map.getBounds().getSouthWest().lng();
	//east = Check_east(east,west);

	Get_landslide_data(west,north,east,south);
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
