const { default: axios } = require("axios");
const xml2js = require("xml2js");
const fs = require("fs");
const { createAudio } = require("node-mp3-player");
const Audio = createAudio();

let lastPlayedGuid = null;

const checkForUpdate = async () => {
	try {
		const response = await axios.get(
			"https://feeds.npr.org/500005/podcast.xml"
		);
		const json = await xml2js.parseStringPromise(response.data);

		const guid = json.rss.channel[0].item[0].guid[0]._;

		if (guid !== lastPlayedGuid) {
			const url = json.rss.channel[0].item[0].enclosure[0].$.url;

			const podcast = await axios({
				method: "get",
				url,
				responseType: "stream",
			});
			podcast.data.pipe(fs.createWriteStream("podcast.mp3"));

			const audio = await Audio("podcast.mp3");
			await audio.play();
			console.log("song over");
		}
	} catch (error) {
		console.log(error);
	}
};

checkForUpdate();
