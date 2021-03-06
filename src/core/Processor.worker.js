/* eslint-disable global-require */
/* eslint-disable import/no-dynamic-require */
/* eslint-disable no-undef */

import GameProcessor from './GameProcessor';
import Chessalyzer from './Chessalyzer';

const { Tracker } = Chessalyzer;

process.on('message', msg => {
	const TrackerList = {};
	const proc = new GameProcessor();

	Object.keys(Tracker).forEach(key => {
		TrackerList[Tracker[key].name] = Tracker[key];
	});

	// merge available Trackers
	if (msg.customPath !== '') {
		const TrackerListCustom = __non_webpack_require__(msg.customPath);

		Object.keys(TrackerListCustom).forEach(key => {
			TrackerList[TrackerListCustom[key].name] = TrackerListCustom[key];
		});
	}

	// select needed analyzers
	const analyzer = [];
	msg.analyzerNames.forEach(name => {
		analyzer.push(new TrackerList[name]());
	});

	proc.attachAnalyzers(analyzer);

	// analyze each game
	msg.games.forEach(game => {
		proc.processGame(game);
	});

	// send result of batch to master
	process.send({
		cntMoves: proc.cntMoves,
		gameAnalyzers: proc.gameAnalyzers,
		moveAnalyzers: proc.moveAnalyzers
	});
});
