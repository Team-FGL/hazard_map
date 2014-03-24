#!/usr/bin/perl
use strict;
my $buffer = $ENV{'QUERY_STRING'};
my %param = map { /([^=]+)=(.+)/} split (/&/,$buffer);

# パラメータの受け取り
my $mode = $param{'mode'};
my $officeCode = $param{'officeCode'};
my $obsrvtnPointCode = $param{'obsrvtnPointCode'};
my $timeAxis = $param{'timeAxis'};


# パラメータのチェック
# このままではtextがコマンドラインインジェクション攻撃されちゃうのでサニタイズすること

my $text=&Get_Contents($mode,$officeCode,$obsrvtnPointCode,$timeAxis);

 
exit 0;


sub Get_Contents(){
	my ($mode,$officeCode,$obsrvtnPointCode,$timeAxis)=@_;
	my $url ='curl "http://153.121.40.227/river/html/full/nrpc0305gDisp.do?mode=&officeCode=' . $officeCode . '&obsrvtnPointCode=' . $obsrvtnPointCode . '&timeAxis=' . $timeAxis . '"';

	print "Content-type: text/html\n";
	print "\n";
	open(FH, "$url|");
	while(my $tmp=<FH>){
		print "$tmp";
	}
	
	close(FH);
}
