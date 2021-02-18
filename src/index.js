const { default: axios } = require("axios");
const xml2js = require("xml2js");
const fs = require("fs");
const config = require("../.config.json");
var player = require('play-sound')(opts = {})

let feed = null;
let lastPlayedGuid = null;
let playOnLoad = false;
let timeout = 10;


const checkForUpdate = async () => {
	try {
		const response = await axios.get(feed);
		const json = await xml2js.parseStringPromise(response.data);

		const guid = json.rss.channel[0].item[0].guid[0]._;

		console.log("Last Guid:", lastPlayedGuid);
		console.log("Current GUID:", guid);

		if (guid !== lastPlayedGuid) {

			console.log("GUIDs are different");

			lastPlayedGuid = guid;

			if(!playOnLoad)
			{
				playOnLoad = true;
				return;
			}

			const url = json.rss.channel[0].item[0].enclosure[0].$.url;

			console.log("fetching podcast: ", url);

			const podcast = await axios({
				method: "get",
				url,
				responseType: "stream",
			});
			podcast.data.pipe(fs.createWriteStream("podcast.mp3"));

			console.log("Playing podcast")

			player.play("podcast.mp3", (err) => {
				console.log(err);
				throw err;
			});

			console.log("Done");
		}
	} catch (error) {
		console.log(error);
	}
};

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
run();
