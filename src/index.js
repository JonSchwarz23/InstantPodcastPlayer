const config = require("../.config.json");
const Podcast = require("./podcast.js");
const log = require("loglevel");
const notifier = require("node-notifier");
const Spotify = require("@jonschwarz23/spotify");

let audio = { player: null };
let playOnLoad = false;
let timeout = 10;
let podcasts = [];
let feed = null;
let spotifyClientId = null;

const loadPodcasts = (urls) => {
	urls.forEach((url, i) => {
		const podcast = new Podcast(url, i, audio);

		if (spotifyClientId) {
			podcast.addEventListener("startPlayback", playbackStartSpotify);
			podcast.addEventListener("stopPlayback", stopPlaybackSpotify);
		}

		podcast.addEventListener("startPlayback", playbackStartNotifier);

		podcasts.push(podcast);
	});
};

const checkForUpdates = async () => {
	for (const podcast of podcasts) {
		await podcast.checkForUpdate(!playOnLoad);
	}
	playOnLoad = true;
};

const processArgumentsAndConfig = () => {
	const argv = require("minimist")(process.argv.slice(2), { boolean: "p" });

	if (config.feed)
		feed = typeof config.feed === "string" ? [config.feed] : config.feed;
	else
		throw new Error(
			"Feed must be set either through command line or config file"
		);
	if (config.playOnLoad) playOnLoad = config.playOnLoad;
	if (config.timeout) timeout = config.timeout;
	if (config.spotify) spotifyClientId = config.spotify;
};

const run = async () => {
	try {
		await checkForUpdates();
	} catch (error) {
		console.log(error);
	} finally {
		setTimeout(run, timeout * 1000);
	}
};

const spotify = {};

const initializeSpotify = async () => {
	spotify.handler = new Spotify(
		spotifyClientId,
		["user-modify-playback-state", "user-read-playback-state"],
		9000
	);
	await spotify.handler.initialize();
};

const playbackStartSpotify = async () => {
	try {
		spotify.playerState = await spotify.handler.getPlayerInformation();

		if (spotify.playerState.is_playing) {
			await spotify.handler.pausePlayback();
		} else {
			spotify.playerState = null;
		}
	} catch (error) {
		console.log("Failed to get spotify state/pause playback", error);
	}
};

const stopPlaybackSpotify = async () => {
	try {
		if (spotify.playerState) {
			await spotify.handler.resumePlayback({
				position_ms: spotify.playerState.progress_ms,
			});
		}
	} catch (error) {
		console.log("Failed to get spotify start playback", error);
	}
};

//Notifications

const playbackStartNotifier = (title, description, picture) => {
	try {
		notifier.notify({
			title,
			message: `Now playing ${description}`,
			icon: picture,
			actions: ["OK", "Skip"],
		});
	} catch (error) {
		console.log("Could not show notification", error);
	}
};

notifier.on("skip", () => {
	if (audio.player) audio.player.kill();
});

//Startup

const main = async () => {
	log.enableAll();
	log.debug("Starting...");
	processArgumentsAndConfig();
	if (spotifyClientId) await initializeSpotify();
	loadPodcasts(feed);
	run();
};

main();
