#!/usr/bin/env perl
use HTTP::Request::Common qw(GET POST PUT DELETE);
use JSON::XS;
use IO::All;
use LWP::UserAgent;
my $base = "http://onecanvas.asyncjs.com";
my $ua = LWP::UserAgent->new;
foreach(@{decode_json(io('backup.txt')->all)}) {
  my $id = (split("[/\.]", $_->{'src'}))[2];
  $ua->request(POST "$base/canvas/$id/save", [publish => 1, content => $_->{content}] );
}

