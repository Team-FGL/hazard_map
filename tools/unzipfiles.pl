#!/usr/bin/perl
use strict;
open(FP, "<list");
while(my $tmp=<FP>){
	chomp $tmp;
	system("unzip -o $tmp");
}
exit 0;
