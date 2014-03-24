#!/usr/bin/perl
use strict;
my $buffer = $ENV{'QUERY_STRING'};
my %param = map { /([^=]+)=(.+)/} split (/&/,$buffer);

my $west = $param{'west'};
my $north = $param{'north'};
my $east = $param{'east'};
my $south = $param{'south'};
my $p20_007 = $param{'p20_007'};
my $p20_008 = $param{'p20_008'};
my $p20_009 = $param{'p20_009'};
my $p20_010 = $param{'p20_010'};
my $p20_011 = $param{'p20_011'};
my $p20_012 = $param{'p20_012'};

&Check_latlng($north);
&Check_latlng($east);
&Check_latlng($south);
&Check_latlng($west);
&Check_num($p20_007);
&Check_num($p20_008);
&Check_num($p20_009);
&Check_num($p20_010);
&Check_num($p20_011);
&Check_num($p20_012);

#my $url = "http://153.121.40.227/services/v1/json/hinansisetsu?north=$north&east=$east&south=$south&west=$west&p20_007=$p20_007&p20_008=$p20_008&p20_009=$p20_009&p20_010=$p20_010&p20_011=$p20_011&p20_012=$p20_012";
my $url = "http://153.121.40.227/services/v1/json/hinansisetsu?"
	. "north=$north"
	. "&east=$east"
	. "&south=$south"
	. "&west=$west"
	. "&p20_007=$p20_007"
	. "&p20_008=$p20_008"
	. "&p20_009=$p20_009"
	. "&p20_010=$p20_010"
	. "&p20_011=$p20_011"
	. "&p20_012=$p20_012";
$url = 'curl "' . $url . '"';

print "Content-type: text/html\n";
print "\n";

&Get_html($url); 

exit 0;


# subrouting part
sub Get_html{
	my ($url) = @_;
	open(FH, "$url |");
	while(my $tmp=<FH>){
		print $tmp;
	}
	close(FH);
}



# 引数のチェック
sub Check_latlng{
	my ($latlng) =@_;
	if($latlng !~ /^-{0,1}\d+\.{0,1}\d*$/){
		print "Content-type: text/html\n";
		print "\n";
		print "format error.\n";
		print "example: http://pingineer.net/cgi-bin/hazard_map/shelter.cgi?west=139.60238352716976&north=35.782485617294846&east=139.62334767283016&south=35.77653207124703&p20_007=0&p20_008=0&p20_009=1&p20_010=0&p20_011=0&p20_012=1\n";
		exit 0;
	}
}

sub Check_num{
	my ($num) =@_;
	if($num !~ /^\d+$/){
		print "Content-type: text/html\n";
		print "\n";
		print "format error.\n";
		print "example: http://pingineer.net/cgi-bin/hazard_map/shelter.cgi?west=139.60238352716976&north=35.782485617294846&east=139.62334767283016&south=35.77653207124703&p20_007=0&p20_008=0&p20_009=1&p20_010=0&p20_011=0&p20_012=1\n";
		exit 0;
	}
}
