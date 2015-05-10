#!/usr/bin/env node

var Prog  = require('progress');
var JSONΣ = require('JSONStream');

var beeb = require('./');

var bar = new Prog(':current/:total [:bar] :etas', 650);

beeb.fetchLinks()
	.flatMap(beeb.fetchConstituency)
	.tap(bar.tick.bind(bar))
	.through(JSONΣ.stringify())
	.pipe(process.stdout);
