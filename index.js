var request = require('request');
var cheerio = require('cheerio');
var σ       = require('highland');
var url     = require('url');
var numeral = require('numeral');
var JSONΣ   = require('JSONStream');

function bbc(p) {
	return url.resolve('http://www.bbc.co.uk', p);
}

function getConstituencyLinks($) {
	return $('.az-table__row a').map(function() {
		return bbc($(this).attr('href'));
	}).get();
}

function getConstituencyResults($) {
	return $('.parties .party').map(function() {
		var $t = $(this);
		return {
			party: $t.find('.party__name--long').text(),
			candidate: $t.find('.party__result--candidate').text().replace(/, with candidate /, ''),
			votes: numeral().unformat($t.find('.party__result--votes').text()),
			swing: parseFloat($t.find('.party__result--votesnet .pos, .party__result--votesnet .neg').text())
		};
	}).get();
}

function getConstituencyMeta(path, $) {
	return {
		name: $('.constituency-title__title').text(),
		turnout: parseFloat($('.results-turnout__percentage .results-turnout__value').text()),
		id: path.match(/http:\/\/www\.bbc\.co\.uk\/news\/politics\/constituencies\/(\w+)/)[1]
	};
}

function ρ(path) {
	return σ(request(bbc(path))).collect().invoke('join', ['']).map(cheerio.load);
}

function fetchConstituency(p) {
	return ρ(p).map(function($) {
		var meta = getConstituencyMeta(p, $);
		meta.results = getConstituencyResults($);
		return meta;
	});
}

function fetchLinks() {
	return ρ('/news/politics/constituencies').flatMap(getConstituencyLinks);
}

fetchLinks()
	.flatMap(fetchConstituency)
	.through(JSONΣ.stringify())
	.pipe(process.stdout);
