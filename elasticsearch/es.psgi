#!/usr/bin/perl

use strict;
use warnings;
use utf8;

use LWP;
use LWP::Simple qw/mirror/;
use Encode;
use Encode::Guess qw/euc-jp shiftjis 7bit-jis/;
use Amon2::Lite;
use Data::Dumper;

#
__PACKAGE__->load_plugins(qw/Web::JSON/);

#
#binmode(STDOUT, ":utf8");
# elasticsearch host
my $host = "localhost:9200";
# elasticsearch index and type
my %index_info_map = ();
#$index_info_map{medicalinstitution} = {index=>"ksj", type=>"medicalplace", geometry=>"medicalplace"};
$index_info_map{hinansisetsu} = {index=>"ksj", type=>"hinansisetsu", geometry=>"hinansisetsu"};
$index_info_map{shinsuisouteikuiki} = {index=>"ksj", type=>"shinsuisouteikuiki", geometry=>"shinsuisouteikuiki"};
$index_info_map{dosyasaigaikikenkasyo} = {index=>"ksj", type=>"dosyasaigaikikenkasyo", geometry=>"dosyasaigaikikenkasyo"};
# 
my %depthquerymap = ();
$depthquerymap{1}="11 OR 21";
$depthquerymap{2}="12 OR 22 OR 11 OR 21";
$depthquerymap{3}="13 OR 23 OR 12 OR 22 OR 11 OR 21";
$depthquerymap{4}="14 OR 24 OR 25 OR 26 OR 13 OR 23 OR 12 OR 22 OR 11 OR 21";
$depthquerymap{5}="15 OR 27 OR 14 OR 24 OR 25 OR 26 OR 13 OR 23 OR 12 OR 22 OR 11 OR 21";


get '/' => sub {
    my $c = shift;
    return $c->create_response(200, [], ['Hello, world!']);
};
get '/blog' => sub {
    my $c = shift;
    return $c->create_response(200, [], ['Hello, blog world!']);
};

#get '/v1/json/medicalinstitution' => sub {
#    my $c = shift;
get '/v1/json/{key}' => sub {
    my ($c, $args) = @_;
    my $key = $args->{key} || die "oops";
    if(not exists($index_info_map{$key})){
	die "oops [$key]";
    }
    #
    my %param = {};
    if($key eq "hinansisetsu"){
	$param{Name}=encode('utf8',$c->req->param('Name'));
	$param{Address}=encode('utf8',$c->req->param('Address'));
	$param{P20_007}=uc($c->req->param('P20_007'));
	if($param{P20_007} eq ""){
	    $param{P20_007}=uc($c->req->param('p20_007'));
	}
	$param{P20_008}=uc($c->req->param('P20_008'));
	if($param{P20_008} eq ""){
	    $param{P20_008}=uc($c->req->param('p20_008'));
	}
	$param{P20_009}=uc($c->req->param('P20_009'));
	if($param{P20_009} eq ""){
	    $param{P20_009}=uc($c->req->param('p20_009'));
	}
	$param{P20_010}=uc($c->req->param('P20_010'));
	if($param{P20_010} eq ""){
	    $param{P20_010}=uc($c->req->param('p20_010'));
	}
	$param{P20_011}=uc($c->req->param('P20_011'));
	if($param{P20_011} eq ""){
	    $param{P20_011}=uc($c->req->param('p20_011'));
	}
	$param{P20_012}=uc($c->req->param('P20_012'));
	if($param{P20_012} eq ""){
	    $param{P20_012}=uc($c->req->param('p20_012'));
	}
    }elsif($key eq "shinsuisouteikuiki"){
	$param{depth}=$c->req->param('depth');
    }
    my $north = $c->req->param('north');
    my $south = $c->req->param('south');
    my $west = $c->req->param('west');
    my $east = $c->req->param('east');
    my $json = &get_ksj_content($key, $north,$south,$west,$east,%param);
    return $c->create_response(200, ["Content-Type" => "application/json; charset=utf-8"], [$json]);
};

sub get_ksj_content{
    my ($key, $north, $south, $west, $east,%param) = @_;
    my $index = $index_info_map{$key}{index};
    my $type = $index_info_map{$key}{type};
    my $geometry = $index_info_map{$key}{geometry};
    my $uri = "http://$host/$index/$type/_search";
    print $uri." -> ".$geometry."\n";
    my $query ='"match_all" : {}';


    my $postdata =<<EOS;
{
    "from":0, "size" : 2500,
    "query": {
        "filtered" : {
            "query" : {
		"match_all" : {}
            },
            "filter" : {
                "geo_shape" : {
                    "$geometry.geometry": {
                        "shape": {
                            "type" : "envelope",
                            "coordinates" : [[$west ,$north ], [$east , $south]]
                        }
                    }
                }
            }
        }
    }
}
EOS
    if($key eq "hinansisetsu"){
	my @querylist = ();
	if( $param{P20_007} eq "1" ){
	    push(@querylist, "P20_007:1");
	}
	if( $param{P20_008} eq "1" ){
	    push(@querylist, "P20_008:1");
	}
	if( $param{P20_009} eq "1" ){
	    push(@querylist, "P20_009:1");
	}
	if( $param{P20_010} eq "1" ){
	    push(@querylist, "P20_010:1");
	}
	if( $param{P20_011} eq "1" ){
	    push(@querylist, "P20_011:1");
	}
	if( $param{P20_012} eq "1" ){
	    push(@querylist, "P20_012:1");
	}
	if( defined($param{Name}) && $param{Name} ne ""){
	    my $name = $param{Name};
	    push(@querylist, "P20_002:$name");
	}
	if( defined($param{Address}) && $param{Address} ne ""){
	    my $address = $param{Address};
	    push(@querylist, "P20_003:$address");
	}
	my $queryliststring = join(" OR " , @querylist);

$postdata =<<EOS;
{
    "from":0, "size" : 2500,
    "query": {
    "query_string" : {
	"query": "$queryliststring"
    },
        "filtered" : {

            "filter" : {
                "geo_shape" : {
                    "$geometry.geometry": {
                        "shape": {
                            "type" : "envelope",
                            "coordinates" : [[$west ,$north ], [$east , $south]]
                        }
                    }
                }
            }
        }
    }
}
EOS

    }elsif($key eq "shinsuisouteikuiki"){
	my $depth = $param{depth};
	my $depthquery = $depthquerymap{$depth};

$postdata =<<EOS;
{
    "from":0, "size" : 2500,
    "query": {
    "query_string" : {
	"query": "A31_001:$depthquery"
    },
        "filtered" : {

            "filter" : {
                "geo_shape" : {
                    "$geometry.geometry": {
                        "shape": {
                            "type" : "envelope",
                            "coordinates" : [[$west ,$north ], [$east , $south]]
                        }
                    }
                }
            }
        }
    }
}
EOS
    }

    my $ua = LWP::UserAgent->new;
my $res = $ua->post(
	$uri,
    "Content-type"=>"application/x-www-form-urlencoded",
    "Content"=>$postdata);

my $content = $res->content;
    return $content;
}
sub trim {
    my $val = shift;
    $val =~ s/^ *(.*?) *$/$1/;
    return $val;
}

sub _render_raw {
    my ($c, $content_type, $data) = @_;

    my $res = $c->create_response(200);

    $res->content_type($content_type);
    $res->content($data);
    $res->content_length(length $data);

    return $res;
}

__PACKAGE__->to_app(no_x_frame_options => 1);
