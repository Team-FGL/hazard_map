#!/usr/bin/perl
use strict;
my $buffer = $ENV{'QUERY_STRING'};
my %param = map { /([^=]+)=(.+)/} split (/&/,$buffer);

my $north = $param{'north'};
my $east = $param{'east'};
my $south = $param{'south'};
my $west = $param{'west'};

$north=&Check_latlng($north);
$east=&Check_latlng($east);
$south=&Check_latlng($south);
$west=&Check_latlng($west);

my $query ='curl --user kamo:bl#0wkSU3 -XGET "http://153.121.40.227/abk/v1/json/abk?'
	. "&north=$north&east=$east&south=$south&west=$west\"";
 
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
