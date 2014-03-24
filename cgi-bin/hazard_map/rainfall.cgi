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

print "Content-type: text/html\n";
print "\n";

my $type = "rainfall";

JSON:
my $query = Make_query($west,$north,$east,$south,$type);

open(FH, "$query |");
while(my $tmp=<FH>){
	my @array = split(/,/, $tmp);
	if($array[5] =~ /^\"hits\":\{\"total\":(\d+)$/){
		my $num = $1;
		if($num >= 1000){
			close(FH);
=pod
			for(my $i=0; $i<=7; $i++){
				print "$array[$i],";
			}
			print "$array[8]";
			print "}]}}";
=cut
			$type = "rainfall_area";
			goto JSON;
		} else{
			print $tmp;
		}
	} 
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
		print "example: http://pingineer.net/cgi-bin/hazard_map/rainfall.cgi?north=35.62752873025489&east=134.44981870385743&south=35.61062637667083&west=134.4089632961426\n";
		exit 0;
	}
	return $latlng;
}

sub Make_query{
	my ($west,$north,$east,$south,$type) = @_;
	my $box = "[[" . $west . "," . $north . "]
		,[" . $east . "," . $south . "]]";

	my $query = q|curl -XGET "http://localhost:9200/hazard_map/| . $type . q|/_search" -d '{
		"query": {
			"filtered" : {
				"query" : {
					"match_all" : {}
				},
				"filter" : {
					"geo_shape": {
						"| . $type . q|.geometry": {
							"shape": {
								"type" : "envelope",
								"coordinates" : | . $box . q|
							}
						}
					}
				}
			}
		}, "size":1000
	}'|;
	return $query;
}
