/*// console.log
console.log("Hello Console")

// process stdout
process.stdout.write("Hello stdout!\n")

// write takes a buffer. This shows that console.log is doing more than just calling process
try {
    console.log({hello: "object"})
    process.stdout.write({hello: "object"});
} catch (e) {
    process.stderr.write("Can't write something not easily cast as a buffer like an object");
}*/

"use strict";

const fs = require('fs');
const path = require('path');
const util = require("util");

const getStdin = require("get-stdin");
// minimist, has no deps. alternatively yargs
// require vs import -- import is for es modules which started to be supported in v12
const args = require("minimist")(
    process.argv.slice(2),
    {
        boolean: [ "help" ],
        string: [ "file" ]
    }
);

const fsReadFileAsync = util.promisify(fs.readFile);

const BASEFILEPATH = path.resolve(process.env.BASEFILEPATH || __dirname);

// help output
const printHelp = () => {
    console.log("example_01 usage:");
    console.log("   index.js ..arguments..");
    console.log("");
    console.log("--help             print this help");
    console.log("--file={FILEPATH}  process file at {FILEPATH}");
    console.log("--in, -            read file from stdin");
    console.log("");
}

const error = (msg, showHelp = false) => {
    process.exitCode = 1;
    console.error(msg.toString());
    if (showHelp) {
        console.log("");
        printHelp();
    }
}

const processFile = (filepath) => {
    // Uses sync is okay with command line scripts or at start up. Just avoid this when writing server code
    try {
        /*const contents = fs.readFileSync(filepath);
        process.stdout.write(contents);
        // great time to use process.write because readFile returns a buffer*/
        console.log(fs.readFileSync(filepath, "utf-8").toUpperCase());
    } catch (e) {
        error(e);
    }
}

const processContent = (content) => console.log(content.toUpperCase());

if (process.argv.length <= 2 || args.help) {
    printHelp();
} else if (args.in || args._.includes("-")) {
    getStdin().then(processContent, error);
} else if (args.file) {
    processFile(path.join(BASEFILEPATH, args.file));
} else {
    error("Incorrect usage", true);
}

// process.exit();
