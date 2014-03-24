
// 避難経路再計算
function calcRoute() {
  var start = document.getElementById('current').value;
  var end = document.getElementById('shelter').value;
	if(current_latlng){start=current_latlng;}
	if(shelter_latlng){end=shelter_latlng;}

  var request = {
      origin:start,
      destination:end,
      travelMode: google.maps.TravelMode.DRIVING
  };
  directionsService.route(request, function(response, status) {
    if (status == google.maps.DirectionsStatus.OK) {
      directionsDisplay.setDirections(response);
    }
  });
}


// 使ってない
function GetGeoLocation(){
  if (navigator.geolocation) {

    // 現在の位置情報を取得
    navigator.geolocation.getCurrentPosition(

      // （1）位置情報の取得に成功した場合
      function (pos) {
        var location ="<li>"+"緯度：" + pos.coords.latitude + "</li>";
        location += "<li>"+"経度：" + pos.coords.longitude + "</li>";
        document.getElementById("location").value = location;
      },
      // （2）位置情報の取得に失敗した場合
      function (error) {
        var message = "";

        switch (error.code) {

          // 位置情報が取得できない場合
          case error.POSITION_UNAVAILABLE:
            message = "位置情報の取得ができませんでした。";
            break;

          // Geolocationの使用が許可されない場合
          case error.PERMISSION_DENIED:
            message = "位置情報取得の使用許可がされませんでした。";
            break;

          // タイムアウトした場合
          case error.PERMISSION_DENIED_TIMEOUT:
            message = "位置情報取得中にタイムアウトしました。";
            break;
        }
        window.alert(message);
      }
    );
  } else {
    window.alert("本ブラウザではGeolocationが使えません");
  }
}


// 座標から住所へ変換
function getAddress(lat,lng, id) {
	var latlng = new google.maps.LatLng(lat,lng);
  var geocoder = new google.maps.Geocoder();
  geocoder.geocode({
    //latLng: latlng
    location: latlng
  }, function(results, status) {
    if (status == google.maps.GeocoderStatus.OK) {
      if (results[0].geometry) {

          var address = results[0].formatted_address.replace(/^日本, /, '');
					document.getElementById(id).value = address;
					calcRoute();
      }
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

// 位置情報の取得
function getCurrentLocation() {
	// geo locationの取得
	navigator.geolocation.getCurrentPosition(
		// （1）位置情報の取得に成功した場合
		function (pos) {
			//if($("input[name=center-position]:checked").val()==1){
			//	map.panTo(new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude));
			//}
			current_latlng=pos.coords.latitude + "," + pos.coords.longitude;
			map.panTo(new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude));
			getAddress(pos.coords.latitude, pos.coords.longitude, "current");
	});
}


// 住所や名称等から座標を取得
function Get_latlng_from_address(text_id) {
	var place =document.getElementById(text_id).value;
	var geocoder = new google.maps.Geocoder();

	geocoder.geocode({
		address: place
		}, function(results, status) {
			if (status == google.maps.GeocoderStatus.OK) {
				var bounds = new google.maps.LatLngBounds();
				// 結果は配列で来る
				//for (var i in results) {
				//	if (results[i].geometry) {
				//		var latlng = results[i].geometry.location;
				//		var address = results[i].formatted_address.replace(/^日本, /, '');
				//	}
				//}

				// 面倒なので検索最上位へpan
				map.panTo(results[0].geometry.location);

			} else if (status == google.maps.GeocoderStatus.ERROR) {
				alert("connection error");
			} else if (status == google.maps.GeocoderStatus.INVALID_REQUEST) {
				alert("requst string error");
			} else if (status == google.maps.GeocoderStatus.OVER_QUERY_LIMIT) {
				alert("too mach quary");
			} else if (status == google.maps.GeocoderStatus.REQUEST_DENIED) {
				alert("can't use geocode");
			} else if (status == google.maps.GeocoderStatus.UNKNOWN_ERROR) {
				alert("server error");
			} else if (status == google.maps.GeocoderStatus.ZERO_RESULTS) {
				alert("not found");
			} else {
				alert("error");
			}
	});
}


