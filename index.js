var request = require('request');
var cheerio = require('cheerio');
var σ       = require('highland');

function getConstituencyLinks(body) {
	var $ = cheerio.load(body);
	return $('.az-table__row a').map(function() {
		return $(this).attr('href');
	}).get();
}

σ(request('http://www.bbc.co.uk/news/politics/constituencies'))
.flatMap(getConstituencyLinks)
.each(σ.log);
