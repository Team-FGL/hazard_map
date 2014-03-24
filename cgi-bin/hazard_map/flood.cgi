#!/usr/bin/perl
use strict;
my $buffer = $ENV{'QUERY_STRING'};
my %param = map { /([^=]+)=(.+)/} split (/&/,$buffer);

my $west = $param{'west'};
my $north = $param{'north'};
my $east = $param{'east'};
my $south = $param{'south'};
my $depth = $param{'depth'};

&Check_latlng($north);
&Check_latlng($east);
&Check_latlng($south);
&Check_latlng($west);
&Check_num($depth);

my $url = "http://153.121.40.227/services/v1/json/shinsuisouteikuiki?north=$north&east=$east&south=$south&west=$west&depth=$depth";
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

sub Read_kml{
	my ($scale, $depth, $tmp) = @_;

  my @file = split(/\//, $tmp);
  system("tar xOf /home/flood-map/flood/$scale/depth$depth/$file[0].tar $file[0]/$file[1]");

}


# 引数のチェック
sub Check_latlng{
	my ($latlng) =@_;
	if($latlng !~ /^-{0,1}\d+\.{0,1}\d*$/){
		print "Content-type: text/html\n";
		print "\n";
		print "format error.\n";
		print "example: http://pingineer.net/cgi-bin/hazard_map/flood.cgi?north=35.62752873025489&east=134.44981870385743&south=35.61062637667083&west=134.4089632961426&depth=5\n";
		exit 0;
	}
}

sub Check_num{
	my ($num) =@_;
	if($num !~ /^\d+$/){
		print "Content-type: text/html\n";
		print "\n";
		print "format error.\n";
		print "example: http://pingineer.net/cgi-bin/hazard_map/flood.cgi?north=35.62752873025489&east=134.44981870385743&south=35.61062637667083&west=134.4089632961426&depth=5\n";
		exit 0;
	}
}
