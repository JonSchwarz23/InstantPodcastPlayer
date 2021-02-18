const { default: axios } = require("axios");
const xml2js = require("xml2js");
const fs = require("fs");
const config = require("../.config.json");
const player = require('play-sound')(opts = {})
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

let audio = null;
let feed = null;
let lastPlayedGuid = null;
let playOnLoad = false;
let timeout = 10;


const checkForUpdate = async () => {
	try {
		const response = await axios.get(feed);
		const json = await xml2js.parseStringPromise(response.data);

		const guid = json.rss.channel[0].item[0].guid[0]._;

		if (guid !== lastPlayedGuid) {

			lastPlayedGuid = guid;

			if(!playOnLoad)
			{
				playOnLoad = true;
				return;
			}

			const url = json.rss.channel[0].item[0].enclosure[0].$.url;

			const podcast = await axios({
				method: "get",
				url,
				responseType: "stream",
			});

			podcast.data.pipe(fs.createWriteStream("podcast.mp3"));

			await playPodcast();

		}
	} catch (error) {
		console.log(error);
	}
};

const playPodcast = () => {
	if(audio) return;

	return new Promise((resolve, error) => {
		audio = player.play("podcast.mp3", (err) => {
			audio = null;
			if(err) error(err);
			else resolve();
		});
	});
	
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
				if(audio) audio.kill();
			}
			else if(command === "Start") {
				playPodcast();
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

	if(config.feed) feed = config.feed;
	if(config.playOnLoad) playOnLoad = config.playOnLoad;
	if(config.timeout) timeout = config.timeout;

	if(argv._.length >= 1) feed = argv._[0];
	if(argv.t) timeout = parseInt(argv.t);
	if(argv.p) playOnLoad = true;

	if(!feed) throw new Error("Feed must be set either through command line or config file");
}

const run = async () => {
	try
	{
		await checkForUpdate();
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

processArgumentsAndConfig();
handleInput();
run();
