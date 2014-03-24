#!/usr/bin/perl
use strict;
my $buffer = $ENV{'QUERY_STRING'};
my %param = map { /([^=]+)=(.+)/} split (/&/,$buffer);

my $lat = $param{'lat'};
my $lon = $param{'lon'};
my $radius = $param{'radius'};

$lat=&Check_latlng($lat);
$lon=&Check_latlng($lon);
$radius=&Check_latlng($radius);
#$radius =  500;

my $query ='curl --user kamo:bl#0wkSU3 -XGET "https://kyoto.smartercity.jp/api/v1/places?rdf_type=ugx_Parking&ugx_targetTransportation=ugx_Car'
	. "&lat=$lat&lon=$lon&radius=$radius\"";
 
print "Content-type: text/html\n";
print "\n";

open(FH, "$query |");
while(my $tmp=<FH>){
	print $tmp;
}
close(FH);


exit 0;

# 引数のチェック
sub Check_latlng{
	my ($latlng) =@_;

	if($latlng !~ /^-{0,1}\d+\.{0,1}\d*$/){
		print "Content-type: text/html\n";
		print "\n";
		print "format error.\n";
		print "example: http://pingineer.net/cgi-bin/flood-map_kyoto/shelter.cgi?lat=35.0116391&lon=135.76803210000003&radius=2000";
		exit 0;
	}
	return $latlng;
}
