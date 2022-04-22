"use strict";

const fs = require("fs");
const path = require("path");

const sharp = require("sharp");
const chalk = require("chalk");
const output = require("sharp/lib/output");
const argv = require("minimist")(process.argv.slice(2));

let tilesNumber = 25;
let outputResolution = 1000;

let input = path.resolve(__dirname, "img.png");
let tile = path.resolve(__dirname, "img/tile.jpg");

if (argv._[0]) {
  input = path.resolve(__dirname, argv._[0]);
  console.log(input);
} else {
  console.error(chalk.red("Please, specify a valid path."));
}

if (argv.r && argv.n) {
  outputResolution = +argv.r;
  tilesNumber = +argv.n;
} else {
  console.warn(
    chalk.yellow(
      `Using default values. Width: ${outputResolution}. Tiles:${tilesNumber}`
    )
  );
}

const create = async () => {
  await sharp(tile)
    .resize({ width: Math.ceil(outputResolution / tilesNumber) })
    .toBuffer()
    .then((data) => {
      tile = data;
    });

  await sharp(input)
    .resize({ width: tilesNumber })
    .toBuffer()
    .then((data) => {
      sharp(data)
        .resize({
          width: Math.ceil(outputResolution / tilesNumber) * tilesNumber,
          kernel: sharp.kernel.nearest,
        })
        .composite([
          {
            input: tile,
            gravity: "northwest",
            tile: true,
            blend: "overlay",
          },
        ])
        .toBuffer()
        .then((data) => resizeOutput(data));
    });
};

const resizeOutput = (data) => {
  const output = path.resolve(
    path.dirname(input),
    `${path.parse(input).name}_result${path.extname(input)}`
  );
  console.log(`Saving as ${output}`);
  try {
    if (
      Math.ceil(outputResolution / tilesNumber) * tilesNumber !=
      outputResolution
    ) {
      sharp(data)
        .resize({
          width: outputResolution,
          kernel: sharp.kernel.lanczos3,
        })
        .toFile(output);
    } else {
      sharp(data).toFile(output);
    }
    console.log(chalk.green("File saved!"));
  } catch (err) {
    console.error(chalk.red("File couldn't be saved!"));
  }
};

create();
