const open = require("open");
const cryptoRandomString = require("crypto-random-string");
const crypto = require("crypto");
const express = require("express");
const axios = require("axios");
const base64url = require("base64url");

module.exports = class {
  constructor(clientId, scope, port) {
    this.clientId = clientId;
    this.port = port || 9000;
    this.scope = scope || [
      "user-modify-playback-state",
      "user-read-playback-state",
    ];
    this.redirectURI = `http%3A%2F%2Flocalhost%3A${this.port}%2Fcallback%2F`;
  }

  async initialize() {
    const randomString = cryptoRandomString({ length: 100 });
    const hash = crypto
      .createHash("sha256")
      .update(randomString)
      .digest("base64");
    const code_challenge = base64url.fromBase64(hash);
    const code = await this.getCode(code_challenge);
    const tokenResponse = await this.getToken(code, randomString);

    this.spotifyInstance = axios.create({
      baseURL: "https://api.spotify.com/v1/",
      timeout: 5000,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    this.handleToken(tokenResponse);
  }

  async getToken(code, verifier) {
    try {
      const params = new URLSearchParams();
      params.append("client_id", this.clientId);
      params.append("grant_type", "authorization_code");
      params.append("code", code);
      params.append("redirect_uri", `http://localhost:${this.port}/callback/`);
      params.append("code_verifier", verifier);

      const response = await axios.post(
        "https://accounts.spotify.com/api/token",
        params,
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );

      return response.data;
    } catch (error) {
      console.log(error);
    }
  }

  handleToken(tokenResponse) {
    this.accessToken = tokenResponse["access_token"];
    this.spotifyInstance.defaults.headers.common[
      "Authorization"
    ] = `Bearer ${this.accessToken}`;
    this.rToken = tokenResponse["refresh_token"];

    setTimeout(
      this.refreshToken.bind(this),
      (tokenResponse["expires_in"] - 120) * 1000
    );
  }

  async refreshToken() {
    try {
      const params = new URLSearchParams();
      params.append("client_id", this.clientId);
      params.append("grant_type", "refresh_token");
      params.append("refresh_token", this.rToken);

      const response = await axios.post(
        "https://accounts.spotify.com/api/token",
        params,
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );

      this.handleToken(response.data);
    } catch (error) {
      console.log("Issue while refreshing token", error);
    }
  }

  buildAuthorizationURI(hash) {
    return `https://accounts.spotify.com/authorize?response_type=code&client_id=${
      this.clientId
    }&redirect_uri=${this.redirectURI}&scope=${this.scope.join(
      "+"
    )}&code_challenge=${hash}&code_challenge_method=S256`;
  }

  getCode(hash) {
    return new Promise((resolve, error) => {
      let server = null;
      const app = express();

      app.get("/callback", (req, res) => {
        res.send("Authenticated!");
        server.close();
        if (req.query.code) resolve(req.query.code);
        else error(req.query.error);
      });

      server = app.listen(this.port, () => {
        console.log(`Listening on port ${this.port} for Spotify`);
        open(this.buildAuthorizationURI(hash));
      });
    });
  }

  async pausePlayback() {
    try {
      await this.spotifyInstance.put("me/player/pause");
      return true;
    } catch (error) {
      console.log("Failed to pause playback", error);
      return false;
    }
  }

  async resumePlayback(data) {
    try {
      await this.spotifyInstance.put("me/player/play", data);
    } catch (error) {
      console.log("Failed to resume playback", error);
    }
  }

  async getPlayerInformation() {
    try {
      const response = await this.spotifyInstance.get("me/player");
      return response.data;
    } catch (error) {
      console.log("Failed to get playback status", error);
    }
  }
};
