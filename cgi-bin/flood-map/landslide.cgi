#!/usr/bin/perl
use strict;
my $buffer = $ENV{'QUERY_STRING'};
my @indata = split (/&/,$buffer);

my $north = substr($indata[0],6);
my $east = substr($indata[1],5);
my $south = substr($indata[2],6);
my $west = substr($indata[3],5);
my $zoom = substr($indata[4],5);
my $depth = substr($indata[5],6);

&Check_latlng($north);
&Check_latlng($east);
&Check_latlng($south);
&Check_latlng($west);
&Check_num($zoom);
&Check_num($depth);

my $path ="/home/flood-map";

#my @scales = ("small", "midle", "large");
#my $scale ="small";
#my $scale;
#if ($zoom >=15){
#	$scale ="small";
#} elsif($zoom <=11){
#	$scale ="large";
#} else {
#	$scale ="midle";
#}

#my @file_name;

#foreach my $scale (@scales){
#foreach my $tmp_scale (@scales){
	#my @file_name = &Check_square($north, $south, $east, $west);
	#my @square_name = &Check_square("index", $north, $south, $east, $west, 0);
	#my @square_name = &Check_square($scale, "index", $north, $south, $east, $west, 0);
	#my @square_name = &Check_square($scale, "index", $north, $south, $east, $west, $depth);
	my @square_name = &Check_square("index", $north, $south, $east, $west, $depth);
	my @file_name;
	#@file_name =();
	foreach my $square (@square_name){
		#push @file_name,  &Check_square($scale, $square, $north, $south, $east, $west, 5);
		#push @file_name,  &Check_square($scale, $square, $north, $south, $east, $west, $depth);
		push @file_name,  &Check_square( $square, $north, $south, $east, $west, $depth);
	}
#	if($#file_name <= 8000){
#		$scale = $tmp_scale;
#		last;
#	} 
#}

print "Content-type: text/html\n";
print "\n";

#&Read_kml_template("$path/flood/template/head_temp.kml"); 
&Read_kml_template("$path/landslide/template/head_temp.kml"); 


foreach my $kml (@file_name){
	#&Read_kml_template("$path/flood/kml/$kml"); 
	#&Read_kml_template("$path/flood/$scale/depth5/$kml"); 
	#&Read_kml_template("$path/flood/$scale/depth$depth/$kml"); 
	#&Read_kml($scale, $depth, $kml); 
	#&Read_kml_template("$path/flood/small/depth5/$kml"); 
	&Read_kml_template("$path/landslide/kml/$kml"); 
}

#&Read_kml_template("$path/flood/template/tail_temp.kml"); 
&Read_kml_template("$path/landslide/template/tail_temp.kml"); 

# subrouting part
sub Read_kml_template{
	my ($file) = @_;
	open(FP, "<$file");
	while(my $tmp=<FP>){
		print $tmp;
	}
	close(FP);
}

#sub Read_kml{
	#my ($scale, $depth, $tmp) = @_;
	my ($tmp) = @_;

  #my @file = split(/\//, $tmp);
  #system("tar xOf /home/flood-map/flood/$scale/depth$depth/$file[0].tar $file[0]/$file[1]");

#}

# subrouting part
sub Check_square{
	#my ($file, $north, $south, $east, $west, $depth) = @_;
	#my ($scale, $file, $north, $south, $east, $west, $depth) = @_;
	my ($file, $north, $south, $east, $west, $depth) = @_;
	my @files;
	#open(FP, "<$path/flood/square/$file");
	#open(FP, "<$path/flood/$scale/square5/$file");
	#open(FP, "<$path/flood/$scale/square$depth/$file");
	open(FP, "<$path/landslide/square/$file");
	while(my $tmp=<FP>){
		#if($tmp =~ /^(\D+\/\d+),(\d+\.{0,1}\d*),(\d+\.{0,1}\d*),(\d+\.{0,1}\d*),(\d+\.{0,1}\d*)/){
		#if($tmp =~ /^(.*),(\d+\.{0,1}\d*),(\d+\.{0,1}\d*),(\d+\.{0,1}\d*),(\d+\.{0,1}\d*),(\d+)/){
		if($tmp =~ /^(.*),(\d+\.{0,1}\d*),(\d+\.{0,1}\d*),(\d+\.{0,1}\d*),(\d+\.{0,1}\d*)/){
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
    print "format error.\n";
    print "example: http://pingineer.net/cgi-bin/flood-map/landslide.cgi?north=35.62752873025489&east=134.44981870385743&south=35.61062637667083&west=134.4089632961426&zoom=16&depth=5\n";
		exit 0;
	}
}

sub Check_num{
	my ($num) =@_;
	if($num !~ /^\d+$/){
		print "Content-type: text/html\n";
		print "\n";
    print "format error.\n";
    print "example: http://pingineer.net/cgi-bin/flood-map/landslide.cgi?north=35.62752873025489&east=134.44981870385743&south=35.61062637667083&west=134.4089632961426&zoom=16&depth=5\n";
		exit 0;
	}
}
