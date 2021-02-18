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
