#!/usr/bin/perl
use strict;
my $buffer = $ENV{'QUERY_STRING'};
my @indata = split (/&/,$buffer);

my $north = substr($indata[0],6);
my $east = substr($indata[1],5);
my $south = substr($indata[2],6);
my $west = substr($indata[3],5);
#my $zoom = substr($indata[4],5);
#my $depth = substr($indata[5],6);

&Check_latlng($north);
&Check_latlng($east);
&Check_latlng($south);
&Check_latlng($west);
#&Check_num($zoom);
#&Check_num($depth);

my $path ="/home/flood-map";



my @file_name = &Check_square("index", $north, $south, $east, $west);

print "Content-type: text/html\n";
print "\n";

&Read_kml_template("$path/water_level_overlay/template/head_temp.kml"); 


foreach my $kml (@file_name){
	&Read_kml_template("$path/water_level_overlay/kml/$kml"); 
}

&Read_kml_template("$path/water_level_overlay/template/tail_temp.kml"); 

# subrouting part
sub Read_kml_template{
	my ($file) = @_;
	open(FP, "<$file");
	while(my $tmp=<FP>){
		print $tmp;
	}
	close(FP);
}


# subrouting part
sub Check_square{
	my ($file, $north, $south, $east, $west) = @_;
	my @files;
	open(FP, "<$path/water_level_overlay/square/$file");
	while(my $tmp=<FP>){
		if($tmp =~ /^(.*),(\d+\.{0,1}\d*),(\d+\.{0,1}\d*),(\d+\.{0,1}\d*),(\d+\.{0,1}\d*)\n/){
			#print $tmp;
			my $kml_file = $1;
			my $kml_north = $2;
			my $kml_south = $3;
			my $kml_east = $4;
			my $kml_west = $5;
			#my $kml_depth = $6;
			#if($depth < $kml_depth){
			#		next;
			#}

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


# 引数のチェック
sub Check_latlng{
	my ($latlng) =@_;
	if($latlng !~ /^-{0,1}\d+\.{0,1}\d*$/){
		print "Content-type: text/html\n";
		print "\n";
		exit 0;
	}
}

sub Check_num{
	my ($num) =@_;
	if($num !~ /^\d+$/){
		print "Content-type: text/html\n";
		print "\n";
		exit 0;
	}
}
