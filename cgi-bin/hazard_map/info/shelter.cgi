#!/usr/bin/perl
use strict;
my $buffer = $ENV{'QUERY_STRING'};
my %param = map { /([^=]+)=(.+)/} split (/&/,$buffer);

# パラメータの受け取り
#my $lat = $param{'lat'};
#my $lng = $param{'lng'};
my $name = $param{'name'};
my $address = $param{'address'};
my $type = $param{'type'};
my $p20_007 = $param{'p20_007'};
my $p20_008 = $param{'p20_008'};
my $p20_009 = $param{'p20_009'};
my $p20_010 = $param{'p20_010'};
my $p20_011 = $param{'p20_011'};
my $p20_012 = $param{'p20_012'};



# パラメータのチェック
# このままではtextがコマンドラインインジェクション攻撃されちゃうのでサニタイズすること
#$lat = &Check_latlng($lat);
#$lng = &Check_latlng($lng);
$p20_007 = &Check_num($p20_007);
$p20_008 = &Check_num($p20_008);
$p20_009 = &Check_num($p20_009);
$p20_010 = &Check_num($p20_010);
$p20_011 = &Check_num($p20_011);
$p20_012 = &Check_num($p20_012);


# urldecode
$name=&url_decode($name);
$address=&url_decode($address);
$type=&url_decode($type);

#&Create_html($lat,$lng,$name,$address,$type,$p20_007,$p20_008,$p20_009,$p20_010,$p20_011,$p20_012);
&Create_html($name,$address,$type,$p20_007,$p20_008,$p20_009,$p20_010,$p20_011,$p20_012);

 
exit 0;


sub Create_html(){
	#my ($lat,$lng,$name,$address,$type,$p20_007,$p20_008,$p20_009,$p20_010,$p20_011,$p20_012)=@_;
	my ($name,$address,$type,$p20_007,$p20_008,$p20_009,$p20_010,$p20_011,$p20_012)=@_;

	print "Content-type: text/html\n";
	print "\n";

	print '<html lang="ja"><head>';
	print '<style type="text/css">';
	print '#google_translate_element {';
	print 'position: absolute;';
	print 'bottom: 0px;';
	print 'left: 0px;';
	print '}';
	print '</style>';
	print '<meta name="google-translate-customization" content="526935a0d310db25-c6d3142893804877-g6d1a46abc1d0a58d-d"></meta>';
	print '<meta content="text/html; charset=UTF-8" http-equiv="Content-Type">';
	print	'</head><body>';
#	print '<button type="button" onclick=change_shelter(';
#	print $lat . "," . $lng .  ');>ここに避難する</button><hr>';
	print '<table style="font-size:8pt;">';
	print '<tr><th>名称</th><td>' . $name . '</td></tr>';
	print	'<tr><th>住所</th><td>' . $address . '</td></tr>';
	print '<tr><th>施設の種類</th><td>' . $type . '</td></tr>';
	print '</table>';
	print '<br>';
	print '<table style="font-size:8pt;">';
	print '<tr><th colspan="2">災害分類</th></tr>';
	print '<tr><th>地震災害</th><td>' . Check_shelter_spec($p20_007) . '</td></tr>';
	print '<tr><th>津波災害</th><td>' . Check_shelter_spec($p20_008) . '</td></tr>';
	print '<tr><th>水害</th><td>' . Check_shelter_spec($p20_009) . '</td></tr>';
	print '<tr><th>火災災害</th><td>' . Check_shelter_spec($p20_010) . '</td></tr>';
	print '<tr><th>その他</th><td>' . Check_shelter_spec($p20_011) . '</td></tr>';
	print '<tr><th>指定なし</th><td>' .  Check_shelter_spec($p20_012) . '</td></tr>';
	print '</table>';
	print "</div>";
	print '<div id="google_translate_element"></div><script type="text/javascript">';
	print 'function googleTranslateElementInit() {';
	print '  new google.translate.TranslateElement({pageLanguage: "ja", layout: google.translate.TranslateElement.InlineLayout.SIMPLE}, "google_translate_element");';
	print '}';
	print '</script><script type="text/javascript" src="//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"></script>';
	print '</body></html>';

	
}

# 引数のチェック
sub Check_latlng{
	my ($latlng) =@_;
	if($latlng !~ /^-{0,1}\d+\.{0,1}\d*$/){
		print "Content-type: text/html\n";
		print "\n";
		print "format error.\n";
		print 'example: http://pingineer.net/cgi-bin/hazard_map/info/shelter.cgi?lat=35.819591&lng=139.584161&name=%22%E5%8C%97%E6%9C%9D%E9%9C%9E%E5%85%AC%E6%B0%91%E9%A4%A8%22&address=%22%E5%9F%BC%E7%8E%89%E7%9C%8C%E6%9C%9D%E9%9C%9E%E5%B8%82%E6%9C%9D%E5%BF%97%E3%83%B6%E4%B8%981-4-1%22&type=%22%E6%8C%87%E5%AE%9A%E9%81%BF%E9%9B%A3%E5%A0%B4%E6%89%80%22&p20_007=0&p20_008=0&p20_009=0&p20_010=0&p20_011=0&p20_012=1\n';
		exit 0;
	}
	return $latlng;
}

sub Check_num{
	my ($num) =@_;
	if($num !~ /^\d+$/){
		print "Content-type: text/html\n";
		print "\n";
		print "format error.\n";
		print 'example: http://pingineer.net/cgi-bin/hazard_map/info/shelter.cgi?lat=35.819591&lng=139.584161&name=%22%E5%8C%97%E6%9C%9D%E9%9C%9E%E5%85%AC%E6%B0%91%E9%A4%A8%22&address=%22%E5%9F%BC%E7%8E%89%E7%9C%8C%E6%9C%9D%E9%9C%9E%E5%B8%82%E6%9C%9D%E5%BF%97%E3%83%B6%E4%B8%981-4-1%22&type=%22%E6%8C%87%E5%AE%9A%E9%81%BF%E9%9B%A3%E5%A0%B4%E6%89%80%22&p20_007=0&p20_008=0&p20_009=0&p20_010=0&p20_011=0&p20_012=1\n';
		exit 0;
	}
	return $num;
}

sub Check_shelter_spec{
	my($spec)=@_;
	if($spec == 0){
		return "×";
	} else {
		return "○";
	}
}

sub url_encode($) {
  my $str = shift;
  $str =~ s/([^\w ])/'%'.unpack('H2', $1)/eg;
  $str =~ tr/ /+/;
  return $str;
}

sub url_decode($) {
  my $str = shift;
  $str =~ tr/+/ /;
  $str =~ s/%([0-9A-Fa-f][0-9A-Fa-f])/pack('H2', $1)/eg;

  $str =~ tr/"/ /;
  return $str;
}
