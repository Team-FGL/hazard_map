#!/usr/bin/perl

use strict;
use warnings;
use utf8;
my $file=shift;
open(my $fh, "<", $file)
    or die "Cannot open $file: $!";
while(my $line = readline $fh){
    chomp $line;
    if($line =~ /^{\s"type":/){
	$line =~ s/(.*)\,$/$1/;
	my $out = << "EOS";
{ "index" : { "_index" : "ksj", "_type" : "medicalplace" } }
$line
EOS
        print $out;
    }
}
close $fh;
