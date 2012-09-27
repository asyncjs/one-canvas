#!/usr/bin/env perl
use HTTP::Request::Common qw(GET POST PUT DELETE);
use JSON::XS;
use IO::All;
use LWP::UserAgent;
my $base = "http://onecanvas.asyncjs.com";
my $ua = LWP::UserAgent->new;

sub get { $ua->request(GET "$base$_[0]")->content;}
encode_json [map { $_->{file} = get($_->{src}."?clean=1");$_ } @{decode_json(get("/list"))}] > io 'backup.txt'
