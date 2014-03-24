#!/usr/bin/perl
use strict;
my $buffer = $ENV{'QUERY_STRING'};
my %param = map { /([^=]+)=(.+)/} split (/&/,$buffer);

my $west = $param{'west'};
my $north = $param{'north'};
my $east = $param{'east'};
my $south = $param{'south'};

$west=&Check_latlng($west);
$north=&Check_latlng($north);
$east=&Check_latlng($east);
$south=&Check_latlng($south);

my $query ="curl -XGET \"http://localhost:9200/hazard_map/live_cam/_search\" -d '{
	\"query\": {
		\"filtered\" : {
			\"query\" : {
				\"match_all\" : {}
			},
			\"filter\" : {
				\"geo_shape\": {
					\"live_cam.geometry\": {
						\"shape\": {
							\"type\" : \"envelope\",
							\"coordinates\" : [[$west, $north], [$east, $south]]
						}
					}
				}
			}
		}
	}, \"size\":1000
}'";

print "Content-type: text/html\n";
print "\n";

open(FH, "$query |");
while(<FH>){
	print ;
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
		print "example: http://pingineer.net/cgi-bin/hazard_map/live_cam.cgi?north=35.62752873025489&east=134.44981870385743&south=35.61062637667083&west=134.4089632961426\n";
		exit 0;
	}
	return $latlng;
}

