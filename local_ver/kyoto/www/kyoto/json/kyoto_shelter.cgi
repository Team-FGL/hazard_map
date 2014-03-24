#!/usr/bin/perl
use strict;
my $buffer = $ENV{'QUERY_STRING'};
my %param = map { /([^=]+)=(.+)/} split (/&/,$buffer);



my $query ='curl --user kamo:bl#0wkSU3 -XGET "https://kyoto.smartercity.jp/api/v1/places?rdf_type=ugx_Parking&ugx_targetTransportation=ugx_Cycle"';
 
print "Content-type: text/html\n";
print "\n";

open(FH, "$query |");
open(FP, ">bicycles_parking.json");
while(my $tmp=<FH>){
	print FP $tmp;
}
close(FP);
close(FH);


exit 0;
