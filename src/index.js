const config = require("../.config.json");
const readline = require('readline');
const Podcast = require("./podcast.js");
const log = require('loglevel');
const notifier = require('node-notifier');
const Spotify = require("./spotify");
const { async } = require("crypto-random-string");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

let audio = {player: null};
let playOnLoad = false;
let timeout = 10;
let podcasts = [];
let feed = null;
let spotifyHandler = null;

const loadPodcasts = (urls) => {
	urls.forEach((url, i) => {
		podcasts.push(new Podcast(url, i, audio, notifier, spotifyHandler));
	});
};

const checkForUpdates = async () => {
	for(const podcast of podcasts) {
		await podcast.checkForUpdate(!playOnLoad);
	}
	playOnLoad = true;
};

const playPodcasts = async () => {
	for(const podcast of podcasts) {
		await podcast.playPodcast();
	}
};


const requestInput = () => {
	return new Promise(resolve => {
		rl.question("Command: ", (command) => {
			resolve(command);
		})
	});
}

const handleInput = async () => {
	while(true) {
		try
		{
			const command = await requestInput();
			if(command === "Stop") {
				if(audio.player) audio.player.kill();
			}
			else if(command === "Start") {
				playPodcasts();
			}
		}
		catch(error)
		{
			console.error("Error on input", error)
		}
	}
}

const processArgumentsAndConfig = () => {
	const argv = require('minimist')(process.argv.slice(2), {boolean: "p"});

	if(config.feed) feed = typeof config.feed === "string" ? [config.feed] : config.feed;
	if(config.playOnLoad) playOnLoad = config.playOnLoad;
	if(config.timeout) timeout = config.timeout;

	if(argv._.length >= 1) feed = (feed || []).concat(argv._[0]);
	if(argv.t) timeout = parseInt(argv.t);
	if(argv.p) playOnLoad = true;

	if(!feed) throw new Error("Feed must be set either through command line or config file");

	loadPodcasts(feed);
}

const run = async () => {
	try
	{
		await checkForUpdates();
	}
	catch(error)
	{
		console.log(error)
	}
	finally
	{
		setTimeout(run, timeout * 1000);
	}
};

const initializeSpotify = async () => {
	const spotify = new Spotify("b00130f5b7ec4b8b82a3faacdbc5f1e2");
	await spotify.initialize();
	spotifyHandler = spotify;
};

notifier.on('skip', () => {
	if(audio.player) audio.player.kill();
  });

const main = async () => {
	log.enableAll();
	log.debug("Starting...");
	await initializeSpotify();
	processArgumentsAndConfig();
	//handleInput();
	run();
};

main()








