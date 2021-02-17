const { default: axios } = require("axios");
const xml2js = require("xml2js");
const fs = require("fs");
var player = require('play-sound')(opts = {})

let lastPlayedGuid = "ae978519-4720-4a06-b2ec-30814b0de8d1";

const checkForUpdate = async () => {
	try {
		const response = await axios.get(
			"https://feeds.npr.org/500005/podcast.xml"
		);
		const json = await xml2js.parseStringPromise(response.data);

		const guid = json.rss.channel[0].item[0].guid[0]._;

		console.log("Last Guid:", lastPlayedGuid);
		console.log("Current GUID:", guid);

		if (guid !== lastPlayedGuid) {

			console.log("GUIDs are different");

			lastPlayedGuid = guid;

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
		setTimeout(run, 120000);
	}
};

run();
