const { default: axios } = require("axios");
const xml2js = require("xml2js");
const fs = require("fs");
const player = require('play-sound')(opts = {})

const Podcast = class {
    constructor(url, id, audio) {
        this.id = id;
        this.url = url;
        this.audio = audio;
        this.lastPlayedGuid = null; 
    }

    async checkForUpdate(skipPlaying) {
        const response = await axios.get(this.url);
		const json = await xml2js.parseStringPromise(response.data);

		const guid = json.rss.channel[0].item[0].guid[0]._;

		if (guid !== this.lastPlayedGuid) {

			this.lastPlayedGuid = guid;

			if(skipPlaying)
			{
				return;
			}

			const url = json.rss.channel[0].item[0].enclosure[0].$.url;

			const podcast = await axios({
				method: "get",
				url,
				responseType: "stream",
			});

			podcast.data.pipe(fs.createWriteStream(`podcast-${this.id}.mp3`));

			await this.playPodcast();
        }
    }

    playPodcast() {
        if(this.audio.player) return;

        return new Promise((resolve, error) => {
            this.audio.player = player.play(`podcast-${this.id}.mp3`, (err) => {
                this.audio.player = null;
                if(err) error(err);
                else resolve();
            });
        });
    }
}

module.exports = Podcast;