#!/usr/bin/env perl
use HTTP::Request::Common qw(GET POST PUT DELETE);
use JSON::XS;
use IO::All;
use LWP::UserAgent;
my $base = "http://onecanvas.asyncjs.com";
my $ua = LWP::UserAgent->new;
  sub get { $ua->request(GET "$base$_[0]")->content;}

my $count=0;
while(++$count) {
  encode_json [map { $_->{content} = get($_->{src}."?clean=1");$_ } @{decode_json(get("/list"))}] > io "backup$count.txt";
  warn "sleeping";
  sleep 60;
}
