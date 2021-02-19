# Instant Podcast Player

A script that queries a podcast feed. When a new podcast is added it is downloaded and automatically played.

## Prerequisites

Node and NPM - https://nodejs.org/en/download/

One of the audio players that works with play-sound - https://www.npmjs.com/package/play-sound

## Installation

 ```
 git clone git@github.com:JonSchwarz23/instant-podcast-player.git
 
 cd instant-podcast-player
 
 npm install
 ```

## Command Line Options

```
npm start -- [-p] [-t <timeout>] <feed1> [feed2...]

-p            Play most recent podcast on inital load
-t <timeout>  Specify a timeout before querying the feed again
<feed>        The url of the podcast feed
[feed2...]    Any number of additional podcast feeds

example:
npm start -- -p -t 10 https://feeds.npr.org/500005/podcast.xml
```

## Config File

Alternatively to command line agruments you can create a .config.json file in the base directory of the project
```
{
    "feeds": ["https://feeds.npr.org/500005/podcast.xml"],   //Array of urls for each podcast feed
    "timeout": 10,                                           //Specify a timeout before querying the feed again
    "playOnLoad": false                                      //Play most recent podcast on inital load
}
```

## Usage

You can enter a couple of commands after the program has started
```
Command: <command>

Stop   Stops the podcast if one is currently playing
Start  Starts the most recent podcast on the feed
```

## Recommended Podcasts

<a href="https://www.omnycontent.com/d/playlist/4b5f9d6d-9214-48cb-8455-a73200038129/910538ff-31ef-4254-ad19-a7a00176ef6c/73579376-e7f0-4ea2-be51-a7a00176ef7f/podcast.rss">CBS Sports Minute</a>

<a href="https://audioboom.com/channels/3270305.rss">Headline News from The Associated Press</a>

<a href="https://feeds.npr.org/500005/podcast.xml">NPR News Now</a>

<a href="https://video-api.wsj.com/podcast/rss/wsj/minute-briefing">WSJ Minute Briefing</a>

## Warnings

I have only used and tested this on a Windows 10 computer. I would guess there are issues if you were to try to run this in a different enviroment.
