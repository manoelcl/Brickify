"use strict";

const fs = require("fs");
const path = require("path");

const sharp = require("sharp");
const argv = require("minimist")(process.argv.slice(2));

let tilesNumber = 25;
let outputResolution = 1000;

const input = path.resolve(__dirname, "img.jpg");
let tile = path.resolve(__dirname, "tile.jpg");

const create = async () => {
  await sharp(tile)
    .resize({ width: outputResolution / tilesNumber })
    .toBuffer()
    .then((data) => {
      tile = data;
    });

  await sharp(input)
    .resize({ width: tilesNumber })
    .toBuffer()
    .then((data) => {
      sharp(data)
        .resize({ width: outputResolution, kernel: sharp.kernel.nearest })
        .composite([
          {
            input: tile,
            gravity: "northwest",
            tile: true,
            blend: "overlay",
          },
        ])
        .toFile("output.png");
    });
};
create();
