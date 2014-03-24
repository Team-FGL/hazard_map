#!/usr/bin/perl
use strict;
my $buffer = $ENV{'QUERY_STRING'};
my @indata = split (/&/,$buffer);

my $north = substr($indata[0],6);
my $east = substr($indata[1],5);
my $south = substr($indata[2],6);
my $west = substr($indata[3],5);
my $zoom = substr($indata[4],5);
my $p20_007 = substr($indata[5],8);
my $p20_008 = substr($indata[6],8);
my $p20_009 = substr($indata[7],8);
my $p20_010 = substr($indata[8],8);
my $p20_011 = substr($indata[9],8);
my $p20_012 = substr($indata[10],8);

&Check_latlng($north);
&Check_latlng($east);
&Check_latlng($south);
&Check_latlng($west);
&Check_num($zoom);
&Check_num($p20_007);
&Check_num($p20_008);
&Check_num($p20_009);
&Check_num($p20_010);
&Check_num($p20_011);
&Check_num($p20_012);

#my @p20_flg=(0,0,1,0,0,1);
my @p20_flg=($p20_007 ,$p20_008 ,$p20_009 ,$p20_010 ,$p20_011 ,$p20_012);

my $path ="/home/flood-map";



#my @file_name = &Check_square($north, $south, $east, $west);
my @square_name = &Check_square("index", $north, $south, $east, $west);
my @file_name;
foreach my $point (@square_name){
	#push @file_name,  &Check_point($point, $north, $south, $east, $west );
	push @file_name,  &Check_point($point, $north, $south, $east, $west, @p20_flg );
	#my @kentani_hinanjyo = &Check_point($point, $north, $south, $east, $west, @p20_flg );

}

if($#file_name >= 1000){
		@file_name =();
	foreach my $point (@square_name){
		push @file_name,  "$point/$point";
	}
}


print "Content-type: text/html\n";
print "\n";

&Read_kml_template("$path/hinanjyo/template/head_temp.kml"); 

foreach my $kml (@file_name){
	&Read_kml_template("$path/hinanjyo/kml/$kml"); 
	#&Read_kml("$kml"); 
}

&Read_kml_template("$path/hinanjyo/template/tail_temp.kml"); 

# subrouting part
sub Read_kml_template{
	my ($file) = @_;
	open(FP, "<$file");
	while(my $tmp=<FP>){
		print $tmp;
	}
	close(FP);
}

sub Read_kml{
	my ($tmp) = @_;

	my @file = split(/\//, $tmp);
	#system("tar zxOf /home/flood-map/hinanjyo/kml/$file[0].tgz $file[0]/$file[1]");
	system("tar xOf /home/flood-map/hinanjyo/kml/$file[0].tar $file[0]/$file[1]");
	#open(FP, "<$file");
	#while(my $tmp=<FP>){
	#	print $tmp;
	#}
	#close(FP);
}

sub Check_square{
	my ($file, $north, $south, $east, $west) = @_;
	my @files;
	open(FP, "<$path/hinanjyo/point/$file");
	while(my $tmp=<FP>){
		#if($tmp =~ /^(\D+\/\d+),(\d+\.{0,1}\d*),(\d+\.{0,1}\d*),(\d+\.{0,1}\d*),(\d+\.{0,1}\d*)/){
		if($tmp =~ /^(.*),(\d+\.{0,1}\d*),(\d+\.{0,1}\d*),(\d+\.{0,1}\d*),(\d+\.{0,1}\d*)/){
			#print $tmp;
			my $kml_file = $1;
			my $kml_north = $2;
			my $kml_south = $3;
			my $kml_east = $4;
			my $kml_west = $5;

			if($north >= $kml_north && $south <= $kml_north){
				if($east >= $kml_east && $west <= $kml_east){
					push(@files, $kml_file);
					next;
				}
				if($east >= $kml_west && $west <= $kml_west){
					push(@files, $kml_file);
					next;
				}
				if($east <= $kml_east && $west >= $kml_west){
					push(@files, $kml_file);
					next;
				}
			}
			if($north >= $kml_south && $south <= $kml_south){
				if($east >= $kml_east && $west <= $kml_east){
					push(@files, $kml_file);
					next;
				}
				if($east >= $kml_west && $west <= $kml_west){
					push(@files, $kml_file);
					next;
				}
				if($east <= $kml_east && $west >= $kml_west){
					push(@files, $kml_file);
					next;
				}
			}

			if($north <= $kml_north && $south >= $kml_south){
				if($east >= $kml_east && $west <= $kml_east){
					push(@files, $kml_file);
					next;
				}
				if($east >= $kml_west && $west <= $kml_west){
					push(@files, $kml_file);
					next;
				}
				if($east <= $kml_east && $west >= $kml_west){
					push(@files, $kml_file);
					next;
				}
			}



		}
	}
	close(FP);
	return(@files);
}


# ファイル名一覧の取得
sub Get_filename{
	my @file_name;

	# ディレクトリオープン
	opendir(DIRHANDLE, "$path/kml/");
	# ディレクトリエントリの取得
	foreach(readdir(DIRHANDLE)){
		next if /^\.{1,2}$/;    # '.'や'..'をスキップ
		#print "$_\n";
		push @file_name, $_;
	}
	# ディレクトリクローズ
	closedir(DIRHANDLE);

	# sort
	@file_name = sort { $a <=> $b } @file_name;
	return @file_name;

}

sub Check_point{
	my ($file, $north, $south, $east, $west, @p20_flg) = @_;
	my @files;
	open(FP, "<$path/hinanjyo/point/$file");
	while(my $tmp=<FP>){
		#if($tmp =~ /^(\D+\/\d+),(\d+\.{0,1}\d*),(\d+\.{0,1}\d*),(\d+\.{0,1}\d*),(\d+\.{0,1}\d*)/){
		#if($tmp =~ /^(.*),(\d+\.{0,1}\d*),(\d+\.{0,1}\d*),(\d+\.{0,1}\d*),(\d+\.{0,1}\d*)/){
		#if($tmp =~ /^(.*),(\d+\.{0,1}\d*),(\d+\.{0,1}\d*)/){
		if($tmp =~ /^(.*),(\d+\.{0,1}\d*),(\d+\.{0,1}\d*),(\d),(\d),(\d),(\d),(\d),(\d)/){
			#print $tmp;
			my $kml_file = $1;
			my $kml_lat = $2;
			my $kml_lng = $3;

			my @kml_flg = ($4, $5, $6, $7, $8, $9);
			my $syori_flg = 0;

			if($p20_flg[0] ==1 && $kml_flg[0] == 1){
				$syori_flg = 1;
			}
			if($p20_flg[1] ==1 && $kml_flg[1] == 1){
				$syori_flg = 1;
			}
			if($p20_flg[2] ==1 && $kml_flg[2] == 1){
				$syori_flg = 1;
			}
			if($p20_flg[3] ==1 && $kml_flg[3] == 1){
				$syori_flg = 1;
			}
			if($p20_flg[4] ==1 && $kml_flg[4] == 1){
				$syori_flg = 1;
			}
			if($p20_flg[5] ==1 && $kml_flg[5] == 1){
				$syori_flg = 1;
			}

			if ($syori_flg == 0){
				next;
			}

			if($north >= $kml_lat && $south <= $kml_lat){
				if($east >= $kml_lng && $west <= $kml_lng){
					push(@files, $kml_file);
					next;
				}
			}
		}
	}
	close(FP);
	return(@files);
}

# 引数のチェック
sub Check_latlng{
	my ($latlng) =@_;
	if($latlng !~ /^-{0,1}\d+\.{0,1}\d*$/){
		print "Content-type: text/html\n";
		print "\n";
		print "format error.\n";
		print "example: http://pingineer.net/cgi-bin/flood-map/hinanjyo.cgi?north=35.62752873025489&east=134.44981870385743&south=35.61062637667083&west=134.4089632961426&zoom=16&p20_007=0&p20_008=0&p20_009=1&p20_010=0&p20_011=0&p20_012=1\n";
		exit 0;
	}
}

sub Check_num{
	my ($num) =@_;
	if($num !~ /^\d+$/){
		print "Content-type: text/html\n";
		print "\n";
		print "format error.\n";
		print "example: http://pingineer.net/cgi-bin/flood-map/hinanjyo.cgi?north=35.62752873025489&east=134.44981870385743&south=35.61062637667083&west=134.4089632961426&zoom=16&p20_007=0&p20_008=0&p20_009=1&p20_010=0&p20_011=0&p20_012=1\n";
		exit 0;
	}
}
