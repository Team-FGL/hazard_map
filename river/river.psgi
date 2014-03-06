#!/usr/bin/perl

use strict;
use warnings;
use utf8;

use LWP;
use LWP::Simple qw/mirror/;
use Encode;
use Encode::Guess qw/euc-jp shiftjis 7bit-jis/;
use Amon2::Lite;
use MongoDB;
use DateTime;
use Data::Dumper;
use Web::Scraper;
use Cache::FileCache;
use Imager;

#
__PACKAGE__->load_plugins(qw/Web::JSON/);

#
#binmode(STDOUT, ":utf8");

#$MongoDB::BSON::utf8_flag_on = 0;
my $client = MongoDB::MongoClient->new();
my $db = $client->get_database('tutorial');
my $users = $db->get_collection('users');

#
my $cache = Cache::FileCache->new({
  cache_root => './rivercache',
  namespace => 'rivercache',
  default_expires_in  => 300,
});
#
my $motonodata = "元のデータを表示する";
utf8::encode($motonodata);
my $kansokujosuu_title = "観測所数:";
utf8::encode($kansokujosuu_title);
#
my %kansokujosuu = ();
$kansokujosuu{81} = 547;
$kansokujosuu{82} = 919;
$kansokujosuu{83} = 1367;
$kansokujosuu{84} = 673;
$kansokujosuu{85} = 746;
$kansokujosuu{86} = 910;
$kansokujosuu{87} = 655;
$kansokujosuu{88} = 324;
$kansokujosuu{89} = 739;
$kansokujosuu{90} = 30;
#image
my %kouikiimage = ();
$kouikiimage{81} = "";
$kouikiimage{82} = "";
$kouikiimage{83} = "";
$kouikiimage{84} = "";
$kouikiimage{85} = "";
$kouikiimage{86} = "";
$kouikiimage{87} = "";
$kouikiimage{88} = "";
$kouikiimage{89} = "";
$kouikiimage{90} = "";


get '/' => sub {
    my $c = shift;
    return $c->create_response(200, [], ['Hello, world!']);
};
get '/blog' => sub {
    my $c = shift;
    return $c->create_response(200, [], ['Hello, blog world!']);
};
get '/nrpc0305gDisp.do' => sub {
    my $c = shift;
    my %o2 = process_nrpc0305gDisp_do($c);
    return $c->render_json(\%o2);
};
get '/html/full/nrpc0502gDisp.do' => sub {
    my $c = shift;
    my %o2 = process_nrpc0502gDisp_do($c);
    my $pagelastupdate = $o2{pagelastupdate};
    my $chihou = $o2{chihou};
    $chihou =~ s/.*\((.*)\)$/$1/;
    my $gazou = $o2{gazou};
    $gazou =~ s/src=\"/src=\"http:\/\/www.river.go.jp/;
    my $kansokujo = $o2{kansokujo};
    my $originalurl = $o2{originalurl};
    my $hanreiarea = $o2{hanreiarea};

    my $html =<<EOS;
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8"/>
<meta name="google-translate-customization"
content="12a4397f590b163f-edcfdbe8ba9ef56e-g86c284a4e657867c-e"></meta>
<meta http-equiv="refresh" content="600"/>
<style type="text/css">
span.chihou { font-size: 10px; }
span.kansokujo { font-size: 10px; }
span.lastupdate { font-size: 10px; }
div.hanreiarea { left:350px; top: 380px; position: absolute; width: 50px; }
table.spread { background-color: #FFFFFF; font-size: 10px; }
th.spread { background-color: #0000FF; color: #FFFFFF; font-weight: normal; }
span.generation { color: #000000;}
span.dangerous { color: #FF0000;}
span.alarm { color: #FF0000;}
span.wrnng { color: #FFFF00;}
span.release { color: #727272;}
</style>
</head>
<body>
<div id="google_translate_element"></div><script type="text/javascript">
function googleTranslateElementInit() {
    new google.translate.TranslateElement({pageLanguage: 'ja', layout:
      google.translate.TranslateElement.InlineLayout.SIMPLE},
					  'google_translate_element');
}
</script><script type="text/javascript"
src="//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"></script>
<a href="$originalurl" target="_blank"><span class="chihou">$chihou</span></a>
<span class="kansokujo">$kansokujo</span>
<span class="lastupdate">$pagelastupdate</span>
<div>
$gazou
</div>
<div class="hanreiarea">$hanreiarea</div>
</body>
</html>
EOS

    return $c->create_response(200, ["Content-Type" => "text/html; charset=utf-8"], [$html]);
};
get '/html/img/nrpc0502gDisp.do' => sub {
    my $c = shift;
    my $imagedata = process_nrpc0502gDisp_do_image_only($c);

    return _render_raw($c,'image/png', $imagedata);
};
sub process_nrpc0502gDisp_do_image_only {
    my $c = shift;
    my $areaCode = $c->req->param('areaCode');
    my %latestdata = &get_0502_content($areaCode);
    $latestdata{kansokujo} = $kansokujosuu_title.$kansokujosuu{$areaCode};
    my $gazou = $latestdata{gazou};
    $gazou =~ s/.*src=\"([^\"]*)".*/http:\/\/www.river.go.jp$1/;
    my $filename = "0502_$areaCode.png";
    if($kouikiimage{$areaCode} ne $gazou){
        mirror($gazou, $filename);
        $kouikiimage{$areaCode} = $gazou;
    }
    open(IN, "< $filename");
    binmode(IN);
    my $data = join( '', <IN> );
    close(IN);
    return $data;
}
get '/html/img/transparent/nrpc0502gDisp.do' => sub {
    my $c = shift;
    my $imagedata = process_nrpc0502gDisp_do_image_only_transparent($c);

    return _render_raw($c,'image/png', $imagedata);
};
sub process_nrpc0502gDisp_do_image_only_transparent {
    my $c = shift;
    my $areaCode = $c->req->param('areaCode');
    my %latestdata = &get_0502_content($areaCode);
    $latestdata{kansokujo} = $kansokujosuu_title.$kansokujosuu{$areaCode};
    my $gazou = $latestdata{gazou};
    $gazou =~ s/.*src=\"([^\"]*)".*/http:\/\/www.river.go.jp$1/;
    my $filename = "0502_$areaCode.png";
    if($kouikiimage{$areaCode} ne $gazou){
        mirror($gazou, $filename);
        $kouikiimage{$areaCode} = $gazou;
    }
    #
    my $transparent_filename = "transparent_$filename";
    # 1
    my $in = Imager->new;
    $in->read(file=>$filename);
    my $work = Imager->new(xsize => $in->getwidth, ysize => $in->getheight,
                       channels => 4);
    $work->box(filled => 1, color => "66CCFF");
    my $out = $work->difference(other => $in);
    Imager->write_multi({ file=>"1_$transparent_filename", type=>'png' }, $out);
    # 2
    my $in2 = Imager->new;
    $in2->read(file=>"1_$transparent_filename");
    my $work2 = Imager->new(xsize => $in2->getwidth, ysize => $in2->getheight,
                       channels => 4);
    $work2->box(filled => 1, color => "E4E4E4");
    my $out2 = $work2->difference(other => $in2);
    Imager->write_multi({ file=>"$transparent_filename", type=>'png' }, $out2);

    open(IN, "< $transparent_filename");
    binmode(IN);
    my $data = join( '', <IN> );
    close(IN);
    return $data;
}

sub process_nrpc0502gDisp_do {
    my $c = shift;
    my $areaCode = $c->req->param('areaCode');
    my %latestdata = &get_0502_content($areaCode);
    $latestdata{kansokujo} = $kansokujosuu_title.$kansokujosuu{$areaCode};
    return %latestdata;
}
sub get_0502_content{
    my ($areaCode) = @_;
    my $uri = "http://www.river.go.jp/nrpc0502gDisp.do?" . "areaCode=$areaCode";
    my $data = $cache->get($uri);
    if(defined($data)){
    }else{
      #my $content = get($uri);
      my $content = LWP::UserAgent->new->request(
	HTTP::Request->new(GET => $uri))->content;

      $cache->set($uri, $content);
      $cache->Purge();
    }

    my $response = $cache->get($uri);

    &Parse_html_0502($response, $uri);
}
sub Parse_html_0502 {
	my ($response, $uri) = @_;

	my @areaCode = ();
	# http get
	my $data = $response;
	#
        push(@areaCode, $uri);
        my %latestdata = ();
        #
        $latestdata{originalurl}=$uri;
        #
        #
	my $scraper4 = scraper {
	    process '//div[@class="maparea"]', 'ts[]' => 'HTML';
	};
	my $res4 = $scraper4->scrape($data);
	my $i4 = 0;
	for (@{ $res4->{ts} }){
            my $str4 = $_;
            my $deco = decode('shiftjis',$str4);
            my $constr = encode('utf8',$deco);
            $latestdata{gazou}=$constr; 
        }
        #
	my $scraper5 = scraper {
	    process '//div[@class="lastupdate"]', 'ts[]' => 'TEXT';
	};
	my $res5 = $scraper5->scrape($data);
	my $i5 = 0;
	for (@{ $res5->{ts} }){
            my $str5 = &trim($_);
            my $deco = decode('shiftjis',$str5);
            my $constr = encode('utf8',$deco);
            $latestdata{pagelastupdate}=$constr; 
        }
        #
	my $scraper6 = scraper {
	    process '//div[@class="title"]', 'ts[]' => 'TEXT';
	};
	my $res6 = $scraper6->scrape($data);
	my $i6 = 0;
	for (@{ $res6->{ts} }){
            my $str6 = &trim($_);
            my $deco = decode('shiftjis',$str6);
            my $constr = encode('utf8',$deco);
            $latestdata{chihou}=$constr; 
        }
        #
	my $scraper7 = scraper {
	    process '//div[@class="hanreiarea"]', 'ts[]' => 'HTML';
	};
	my $res7 = $scraper7->scrape($data);
	my $i7 = 0;
	for (@{ $res7->{ts} }){
            my $str7 = &trim($_);
            my $deco = decode('shiftjis',$str7);
            my $constr = encode('utf8',$deco);
            $latestdata{hanreiarea}=$constr; 
        }
        return %latestdata;
}
# 0201
get '/html/full/nrpc0201gDisp.do' => sub {
    my $c = shift;
    my %o2 = process_nrpc0201gDisp_do($c);
    my $pagelastupdate = $o2{pagelastupdate};
    my $chihou = $o2{chihou};
    $chihou =~ s/.*\((.*)\)$/$1/;
    my $gazou = $o2{gazou};
    $gazou =~ s/src=\"/src=\"http:\/\/www.river.go.jp/;
    my $originalurl = $o2{originalurl};
    my $hanreiarea = $o2{hanreiarea};

    my $html =<<EOS;
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8"/>
<meta name="google-translate-customization"
content="12a4397f590b163f-edcfdbe8ba9ef56e-g86c284a4e657867c-e"></meta>
<meta http-equiv="refresh" content="600"/>
<style type="text/css">
span.chihou { font-size: 10px; }
span.lastupdate { font-size: 10px; }
div.hanreiarea { left:380px; top: 300px; position: absolute; width: 50px; }
table.spread { background-color: #FFFFFF; font-size: 10px; }
th.spread { background-color: #0000FF; color: #FFFFFF; font-weight: normal; }

span.cl-deeppurple { color: #9900CC; }
span.cl-red { color: #FF0000; }
span.cl-orange { color: #FFCC33; }
span.cl-yellow { color: #FFFF00; }
span.cl-green { color: #339900; }
span.cl-blue { color: #003399; }
span.cl-lightskyblue { color: #99FFFF; }
span.cl-black { color: #000000; }
span.cl-grey { color: #727272; }

</style>
</head>
<body>
<div id="google_translate_element"></div><script type="text/javascript">
function googleTranslateElementInit() {
    new google.translate.TranslateElement({pageLanguage: 'ja', layout:
      google.translate.TranslateElement.InlineLayout.SIMPLE},
					  'google_translate_element');
}
</script><script type="text/javascript"
src="//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"></script>
<a href="$originalurl" target="_blank"><span class="chihou">$chihou</span></a>
<span class="lastupdate">$pagelastupdate</span>
<div>
$gazou
</div>
<div class="hanreiarea">
<table border="1" class="spread">$hanreiarea</table>
</div>
</body>
</html>
EOS

    return $c->create_response(200, ["Content-Type" => "text/html; charset=utf-8"], [$html]);
};
get '/html/img/nrpc0201gDisp.do' => sub {
    my $c = shift;
    my $imagedata = process_nrpc0201gDisp_do_image_only($c);

    return _render_raw($c,'image/png', $imagedata);
};
sub process_nrpc0201gDisp_do_image_only {
    my $c = shift;
    my $areaCode = $c->req->param('areaCode');
    my %latestdata = &get_0201_content($areaCode);
    $latestdata{kansokujo} = $kansokujosuu_title.$kansokujosuu{$areaCode};
    my $gazou = $latestdata{gazou};
    $gazou =~ s/.*src=\"([^\"]*)".*/http:\/\/www.river.go.jp$1/;
    my $filename = "0201_$areaCode.png";
    if($kouikiimage{$areaCode} ne $gazou){
        mirror($gazou, $filename);
        $kouikiimage{$areaCode} = $gazou;
    }
    open(IN, "< $filename");
    binmode(IN);
    my $data = join( '', <IN> );
    close(IN);
    return $data;
}
get '/html/img/transparent/nrpc0201gDisp.do' => sub {
    my $c = shift;
    my $imagedata = process_nrpc0201gDisp_do_image_only_transparent($c);

    return _render_raw($c,'image/png', $imagedata);
};
sub process_nrpc0201gDisp_do_image_only_transparent {
    my $c = shift;
    my $areaCode = $c->req->param('areaCode');
    my %latestdata = &get_0201_content($areaCode);
    $latestdata{kansokujo} = $kansokujosuu_title.$kansokujosuu{$areaCode};
    my $gazou = $latestdata{gazou};
    $gazou =~ s/.*src=\"([^\"]*)".*/http:\/\/www.river.go.jp$1/;
    my $filename = "0201_$areaCode.png";
    if($kouikiimage{$areaCode} ne $gazou){
        mirror($gazou, $filename);
        $kouikiimage{$areaCode} = $gazou;
    }
    #
    my $transparent_filename = "transparent_$filename";
    # 1
    my $in = Imager->new;
    $in->read(file=>$filename);
    my $work = Imager->new(xsize => $in->getwidth, ysize => $in->getheight,
                       channels => 4);
    $work->box(filled => 1, color => "#000000");
    my $out = $work->difference(other => $in);
    Imager->write_multi({ file=>"1_$transparent_filename", type=>'png' }, $out);
    # 2
    my $in2 = Imager->new;
    $in2->read(file=>"1_$transparent_filename");
    my $work2 = Imager->new(xsize => $in2->getwidth, ysize => $in2->getheight,
                       channels => 4);
    $work2->box(filled => 1, color => "#FFFFFF");
    my $out2 = $work2->difference(other => $in2);
    Imager->write_multi({ file=>"2_$transparent_filename", type=>'png' }, $out2);
    # 3
    my $in3 = Imager->new;
    $in3->read(file=>"2_$transparent_filename");
    my $work3 = Imager->new(xsize => $in3->getwidth, ysize => $in3->getheight,
                       channels => 4);
    $work3->box(filled => 1, color => "#66CCFF");
    my $out3 = $work3->difference(other => $in3);
    Imager->write_multi({ file=>"3_$transparent_filename", type=>'png' }, $out3);
    # 4
    my $in4 = Imager->new;
    $in4->read(file=>"3_$transparent_filename");
    my $work4 = Imager->new(xsize => $in4->getwidth, ysize => $in4->getheight,
                       channels => 4);
    $work4->box(filled => 1, color => "#0066FF");
    my $out4 = $work4->difference(other => $in4);
    Imager->write_multi({ file=>"$transparent_filename", type=>'png' }, $out4);


    open(IN, "< $transparent_filename");
    binmode(IN);
    my $data = join( '', <IN> );
    close(IN);
    return $data;
}

sub process_nrpc0201gDisp_do {
    my $c = shift;
    my $areaCode = $c->req->param('areaCode');
    my %latestdata = &get_0201_content($areaCode);
    $latestdata{kansokujo} = $kansokujosuu_title.$kansokujosuu{$areaCode};
    return %latestdata;
}
sub get_0201_content{
    my ($areaCode) = @_;
    my $uri = "http://www.river.go.jp/nrpc0201gDisp.do?" . "areaCode=$areaCode";
    my $data = $cache->get($uri);
    if(defined($data)){
    }else{
      #my $content = get($uri);
      my $content = LWP::UserAgent->new->request(
	HTTP::Request->new(GET => $uri))->content;

      $cache->set($uri, $content);
      $cache->Purge();
    }

    my $response = $cache->get($uri);

    &Parse_html_0201($response, $uri);
}
sub Parse_html_0201 {
	my ($response, $uri) = @_;

	my @areaCode = ();
	# http get
	my $data = $response;
	#
        push(@areaCode, $uri);
        my %latestdata = ();
        #
        $latestdata{originalurl}=$uri;
        #
        #
	my $scraper4 = scraper {
	    process '//div[@class="maparea"]/table[1]/tr[2]/td[1]', 'ts[]' => 'HTML';
	};
	my $res4 = $scraper4->scrape($data);
	my $i4 = 0;
	for (@{ $res4->{ts} }){
            my $str4 = $_;
            my $deco = decode('shiftjis',$str4);
            my $constr = encode('utf8',$deco);
            $latestdata{gazou}=$constr; 
        }
        # TODO update
	my $scraper5 = scraper {
	    process '//div[@class="lastupdate"]', 'ts[]' => 'TEXT';
	};
	my $res5 = $scraper5->scrape($data);
	my $i5 = 0;
	for (@{ $res5->{ts} }){
            my $str5 = &trim($_);
            my $deco = decode('shiftjis',$str5);
            my $constr = encode('utf8',$deco);
            $latestdata{pagelastupdate}=$constr; 
        }
        #
	my $scraper6 = scraper {
	    process '//div[@class="title"]', 'ts[]' => 'TEXT';
	};
	my $res6 = $scraper6->scrape($data);
	my $i6 = 0;
	for (@{ $res6->{ts} }){
            my $str6 = &trim($_);
            my $deco = decode('shiftjis',$str6);
            my $constr = encode('utf8',$deco);
            $latestdata{chihou}=$constr; 
        }
        # hanrei
	my $scraper7 = scraper {
	    #process '//div[@class="hanreiarea"]', 'ts[]' => 'HTML';
	    process '//div[@class="maparea"]/table[1]/tr[2]/td[2]/table[1]', 'ts[]' => 'HTML';
	};
	my $res7 = $scraper7->scrape($data);
	my $i7 = 0;
	for (@{ $res7->{ts} }){
            my $str7 = &trim($_);
            my $deco = decode('shiftjis',$str7);
            my $constr = encode('utf8',$deco);
            $latestdata{hanreiarea}=$constr; 
        }
        return %latestdata;
}

# 0305
get '/html/full/nrpc0305gDisp.do' => sub {
    my $c = shift;
    my %o2 = process_nrpc0305gDisp_do($c);
    my $pagelastupdate = $o2{pagelastupdate};
    my $suiidata = $o2{suiidata};
    my $originalurl = $o2{originalurl};
    my $kansokujo = $o2{kansokujo};
    my $html =<<EOS;
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8"/>
<meta http-equiv="refresh" content="600"/>
<meta name="google-translate-customization"
content="12a4397f590b163f-edcfdbe8ba9ef56e-g86c284a4e657867c-e"></meta>
<style type="text/css">
table.suii { font-size: 10px; }
span.kansokujo { font-size: 10px; }
span.lastupdate { font-size: 10px; }
</style>
</head>
<body>
<div id="google_translate_element"></div><script type="text/javascript">
function googleTranslateElementInit() {
    new google.translate.TranslateElement({pageLanguage: 'ja', layout:
      google.translate.TranslateElement.InlineLayout.SIMPLE},
					  'google_translate_element');
}
</script><script type="text/javascript"
src="//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"></script>
<a href="$originalurl" target="_blank"><span class="kansokujo">$kansokujo</span></a><br>
<span class="lastupdate">$pagelastupdate</span>
<table border="1" width="100%" class="suii">
$suiidata
</table>
</body>
</html>
EOS

    return $c->create_response(200, ["Content-Type" => "text/html; charset=utf-8"], [$html]);
};

sub process_nrpc0305gDisp_do {
    my $c = shift;
    my $mode = $c->req->param('mode');
    my $officeCode = $c->req->param('officeCode');
    my $obsrvtnPointCode = $c->req->param('obsrvtnPointCode');
    my $timeAxis = $c->req->param('timeAxis');

    my $datas = $users->find({"mode"=>$mode, "officeCode"=>$officeCode, "obsrvtnPointCode"=>$obsrvtnPointCode,
          "timeAxis"=>$timeAxis,
          "service"=>"nrpc0305gDisp.do"})->limit(1);
    my $result = "not found";
    my $dt = DateTime->now();

    # id
    my $id = undef;

    if($datas->has_next){
        $result = "find";
        my $doc = $datas->next;
        my $ludt = $doc->{'lastUpdateDateTime'};
        my $sdt = $dt->subtract_datetime_absolute($ludt);
        my $intervalSeconds = $sdt->in_units('seconds');

        my $accessCount = $doc->{'accessCount'};
        $id = $doc->{'_id'};
        $users->update({"_id" => $id},{'$inc'=>{'accessCount'=>1}});
        if($intervalSeconds>600){
            &update_305_content($id,$dt, $mode,$officeCode,$obsrvtnPointCode,$timeAxis);
        }else{
        }
    }else{
        $id = $users->insert
        ({"mode"=>$mode, "officeCode"=>$officeCode, "obsrvtnPointCode"=>$obsrvtnPointCode,
          "timeAxis"=>$timeAxis,
          "lastUpdateDateTime"=>$dt,
          "accessCount"=>1,
	  "service"=>"nrpc0305gDisp.do"
         });
        &update_305_content($id,$dt, $mode,$officeCode,$obsrvtnPointCode,$timeAxis);
    }
    if(defined($id)){
        my $uri = &create_0305_url($mode,$officeCode,$obsrvtnPointCode,$timeAxis);
        my $o1 = $users->find_one({"_id"=>$id});
        my %o2 = (
            "lastUpdateDateTime"=>$o1->{lastUpdateDateTime}->strftime("%Y-%m-%dT%H:%M:%S"),
            "pagelastupdate"=>$o1->{pagelastupdate},
            "suiidata"=>$o1->{suiidata},
            "kansokujo"=>$o1->{kansokujo},
            "originalurl"=>$uri
        );
        return %o2;
    }
    my %error_o2 = ();
     
    return %error_o2; 

};
sub update_305_content {
    my ($id,$dt, $mode,$officeCode,$obsrvtnPointCode,$timeAxis) = @_;
    my %latestdata = &get_0305_content($mode,$officeCode,$obsrvtnPointCode,$timeAxis);
    $users->update({"_id" => $id},{'$set'=>{'lastUpdateDateTime'=>$dt, 'suiidata'=>$latestdata{suiidata}, 'pagelastupdate'=>$latestdata{pagelastupdate}, 'kansokujo'=>$latestdata{kansokujo}}});
}

sub trim {
    my $val = shift;
    $val =~ s/^ *(.*?) *$/$1/;
    return $val;
}

sub get_0305_content{
    my ($mode,$officeCode,$obsrvtnPointCode,$timeAxis) = @_;
    #my $uri = "http://www.river.go.jp/nrpc0305gDisp.do?" . "mode=$mode"."&officeCode=$officeCode"."&obsrvtnPointCode=$obsrvtnPointCode"."&timeAxis=$timeAxis";
    my $uri = &create_0305_url($mode,$officeCode,$obsrvtnPointCode,$timeAxis);
    my $data = $cache->get($uri);
    if(defined($data)){
    }else{
      #my $content = get($uri);
      my $content = LWP::UserAgent->new->request(
	HTTP::Request->new(GET => $uri))->content;

      $cache->set($uri, $content);
      $cache->Purge();
    }

    my $response = $cache->get($uri);

    my %latestdata=&Parse_html_0305($response, $uri);
    my $originalurl = $latestdata{originalurl};

    return %latestdata;
}
sub create_0305_url {
    my ($mode,$officeCode,$obsrvtnPointCode,$timeAxis) = @_;
    my $uri = "http://www.river.go.jp/nrpc0305gDisp.do?" . "mode=$mode"."&officeCode=$officeCode"."&obsrvtnPointCode=$obsrvtnPointCode"."&timeAxis=$timeAxis";
    return $uri;
}
sub Parse_html_0305 {
	my ($response, $uri) = @_;

	my @areaCode = ();
	# http get
	my $data = $response;
	#
        push(@areaCode, $uri);
        my %latestdata = ();
        #
        $latestdata{originalurl}=$uri;
        my $originalurl = $latestdata{originalurl};
        #
	my $scraper4 = scraper {
	    process '//div[@class="hyetographinfoarea"]/table[1]', 'ts[]' => 'HTML';
	};
	my $res4 = $scraper4->scrape($data);
	my $i4 = 0;
	for (@{ $res4->{ts} }){
            my $str4 = $_;
            my $deco = decode('shiftjis',$str4);
            my $constr = encode('utf8',$deco);
            $latestdata{suiidata}=$constr; 
        }
        #
	my $scraper5 = scraper {
	    process '//span[@class="lastupdate"]', 'ts[]' => 'TEXT';
	};
	my $res5 = $scraper5->scrape($data);
	my $i5 = 0;
	for (@{ $res5->{ts} }){
            my $str5 = &trim($_);
            my $deco = decode('shiftjis',$str5);
            my $constr = encode('utf8',$deco);
            $latestdata{pagelastupdate}=$constr; 
        }
        #
        my $telemeter = "テレメータ水位　";
        utf8::encode($telemeter);
	my $scraper7 = scraper {
	    process '//div[@class="title"]', 'ts[]' => 'TEXT';
	};
	my $res7 = $scraper7->scrape($data);
	my $i7 = 0;
	for (@{ $res7->{ts} }){
            my $str7 = $_;
        
            my $deco = decode('shiftjis',$str7);
            my $constr = encode('utf8',$deco);
           
            $constr =~ s/$telemeter(.*)$/$1/;
            $latestdata{kansokujo}=$constr; 
        }
	
        return %latestdata;
}

# 0304
get '/html/full/nrpc0304gDisp.do' => sub {
    my $c = shift;
    my %o2 = process_nrpc0304gDisp_do($c);
    my $pagelastupdate = $o2{pagelastupdate};
    my $uryoudata = $o2{uryoudata};
    my $originalurl = $o2{originalurl};
    my $kansokujo = $o2{kansokujo};
    my $html =<<EOS;
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8"/>
<meta http-equiv="refresh" content="600"/>
<meta name="google-translate-customization"
content="12a4397f590b163f-edcfdbe8ba9ef56e-g86c284a4e657867c-e"></meta>
<style type="text/css">
div.progresslistarea { width: 270px; }
table.uryou { font-size: 10px;  }
th.spread { color: #FFFFFF; background-color: #0000FF; }
span.kansokujo { font-size: 10px; }
span.lastupdate { font-size: 10px; }
</style>
</head>
<body>
<div id="google_translate_element"></div><script type="text/javascript">
function googleTranslateElementInit() {
    new google.translate.TranslateElement({pageLanguage: 'ja', layout:
      google.translate.TranslateElement.InlineLayout.SIMPLE},
					  'google_translate_element');
}
</script><script type="text/javascript"
src="//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"></script>

<a href="$originalurl" target="_blank"><span class="kansokujo">$kansokujo</span></a><br>
<span class="lastupdate">$pagelastupdate</span>
<div class="progresslistarea">
<table border="1" width="100%" class="uryou">
$uryoudata
</table>
</div>
</body>
</html>
EOS

    return $c->create_response(200, ["Content-Type" => "text/html; charset=utf-8"], [$html]);
};

sub process_nrpc0304gDisp_do {
    my $c = shift;
    my $mode = $c->req->param('mode');
    my $officeCode = $c->req->param('officeCode');
    my $obsrvtnPointCode = $c->req->param('obsrvtnPointCode');
    my $timeAxis = $c->req->param('timeAxis');

    my $datas = $users->find({"mode"=>$mode, "officeCode"=>$officeCode, "obsrvtnPointCode"=>$obsrvtnPointCode,
          "timeAxis"=>$timeAxis,
          "service"=>"nrpc0304gDisp.do"})->limit(1);
    my $result = "not found";
    my $dt = DateTime->now();

    # id
    my $id = undef;

    if($datas->has_next){
        $result = "find";
        my $doc = $datas->next;
        my $ludt = $doc->{'lastUpdateDateTime'};
        my $sdt = $dt->subtract_datetime_absolute($ludt);
        my $intervalSeconds = $sdt->in_units('seconds');

        my $accessCount = $doc->{'accessCount'};
        $id = $doc->{'_id'};
        $users->update({"_id" => $id},{'$inc'=>{'accessCount'=>1}});
        if($intervalSeconds>600){
            &update_304_content($id,$dt, $mode,$officeCode,$obsrvtnPointCode,$timeAxis);
        }else{
        }
    }else{
        $id = $users->insert
        ({"mode"=>$mode, "officeCode"=>$officeCode, "obsrvtnPointCode"=>$obsrvtnPointCode,
          "timeAxis"=>$timeAxis,
          "lastUpdateDateTime"=>$dt,
          "accessCount"=>1,
          "service"=>"nrpc0304gDisp.do"
         });
        &update_304_content($id,$dt, $mode,$officeCode,$obsrvtnPointCode,$timeAxis);
    }
    if(defined($id)){
        my $uri = &create_0304_url($mode,$officeCode,$obsrvtnPointCode,$timeAxis);
        my $o1 = $users->find_one({"_id"=>$id});
        my %o2 = (
            "lastUpdateDateTime"=>$o1->{lastUpdateDateTime}->strftime("%Y-%m-%dT%H:%M:%S"),
            "pagelastupdate"=>$o1->{pagelastupdate},
            "uryoudata"=>$o1->{uryoudata},
            "kansokujo"=>$o1->{kansokujo},
            "originalurl"=>$uri,
	    "service"=>"nrpc0304gDisp.do"

        );
        return %o2;
    }
    my %error_o2 = ();
     
    return %error_o2; 

};
sub update_304_content {
    my ($id,$dt, $mode,$officeCode,$obsrvtnPointCode,$timeAxis) = @_;
    my %latestdata = &get_0304_content($mode,$officeCode,$obsrvtnPointCode,$timeAxis);
    $users->update({"_id" => $id},{'$set'=>{'lastUpdateDateTime'=>$dt, 'uryoudata'=>$latestdata{uryoudata}, 'pagelastupdate'=>$latestdata{pagelastupdate}, 'kansokujo'=>$latestdata{kansokujo}}});
}


sub get_0304_content{
    my ($mode,$officeCode,$obsrvtnPointCode,$timeAxis) = @_;
    #my $uri = "http://www.river.go.jp/nrpc0304gDisp.do?" . "mode=$mode"."&officeCode=$officeCode"."&obsrvtnPointCode=$obsrvtnPointCode"."&timeAxis=$timeAxis";
    my $uri = &create_0304_url($mode,$officeCode,$obsrvtnPointCode,$timeAxis);
    my $data = $cache->get($uri);
    if(defined($data)){
    }else{
      #my $content = get($uri);
      my $content = LWP::UserAgent->new->request(
	HTTP::Request->new(GET => $uri))->content;

      $cache->set($uri, $content);
      $cache->Purge();
    }

    my $response = $cache->get($uri);

    my %latestdata=&Parse_html_0304($response, $uri);
    my $originalurl = $latestdata{originalurl};

    return %latestdata;
}
sub create_0304_url {
    my ($mode,$officeCode,$obsrvtnPointCode,$timeAxis) = @_;
    my $uri = "http://www.river.go.jp/nrpc0304gDisp.do?" . "mode=$mode"."&officeCode=$officeCode"."&obsrvtnPointCode=$obsrvtnPointCode"."&timeAxis=$timeAxis";
    return $uri;
}
sub Parse_html_0304 {
	my ($response, $uri) = @_;

	my @areaCode = ();
	# http get
	my $data = $response;
	#
        push(@areaCode, $uri);
        my %latestdata = ();
        #
        $latestdata{originalurl}=$uri;
        my $originalurl = $latestdata{originalurl};
        #
	my $scraper4 = scraper {
	    #process '//div[@class="hyetographinfoarea"]/table[1]', 'ts[]' => 'HTML';
	    process '//div[@class="progresslistarea"]/table[1]', 'ts[]' => 'HTML';

	};
	my $res4 = $scraper4->scrape($data);
	my $i4 = 0;
	for (@{ $res4->{ts} }){
            my $str4 = $_;
            my $deco = decode('shiftjis',$str4);
            my $constr = encode('utf8',$deco);
            $latestdata{uryoudata}=$constr; 
        }
        #
	my $scraper5 = scraper {
	    process '//table[@class="obsrvtnpointarea"]/tr/td/div', 'ts[]' => 'TEXT';
	};
	my $res5 = $scraper5->scrape($data);
	my $i5 = 0;
	for (@{ $res5->{ts} }){
            my $str5 = &trim($_);
            my $deco = decode('shiftjis',$str5);
            my $constr = encode('utf8',$deco);
            $latestdata{pagelastupdate}=$constr; 
        }
        #
        my $telemeter = "テレメータ雨量　";
        utf8::encode($telemeter);
	my $scraper7 = scraper {
	    process '//div[@class="title"]', 'ts[]' => 'TEXT';
	};
	my $res7 = $scraper7->scrape($data);
	my $i7 = 0;
	for (@{ $res7->{ts} }){
            my $str7 = $_;
        
            my $deco = decode('shiftjis',$str7);
            my $constr = encode('utf8',$deco);
           
            $constr =~ s/$telemeter(.*)$/$1/;
	    $constr = &trim($constr);
            $latestdata{kansokujo}=$constr; 
        }
	
        return %latestdata;
}

sub _render_raw {
    my ($c, $content_type, $data) = @_;

    my $res = $c->create_response(200);

    $res->content_type($content_type);
    $res->content($data);
    $res->content_length(length $data);

    return $res;
}

__PACKAGE__->to_app(no_x_frame_options => 1);
