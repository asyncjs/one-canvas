#!/usr/bin/env perl
use v5.14;
use HTTP::Request::Common qw(GET POST PUT DELETE);
use JSON::XS;
use IO::All;
use LWP::UserAgent;
my $base = "http://onecanvas.asyncjs.com";
my $ua = LWP::UserAgent->new;

sub get { $ua->request(GET "$base$_[0]")->content;}
my $stuff = decode_json get("/list");
foreach(@{$stuff}) { $_->{file} = get($_->{src}); }
encode_json($stuff) > io('backup.txt')
