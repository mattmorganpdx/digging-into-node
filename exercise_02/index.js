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
const zlib = require("zlib");
const Transform = require("stream").Transform;

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
let OUTFILEPATH = path.join(BASEFILEPATH, "out.txt")

// help output
const printHelp = () => {
    console.log("example_01 usage:");
    console.log("   index.js ..arguments..");
    console.log("");
    console.log("--help             print this help");
    console.log("--file={FILEPATH}  process file at {FILEPATH}");
    console.log("--in, -            read file from stdin");
    console.log("--out {FILENAME}   output to file")
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
        /*const contents = fs.readFileSync(filepath);
        process.stdout.write(contents);
        // great time to use process.write because readFile returns a buffer*/
        console.log(fs.readFileSync(filepath, "utf-8").toUpperCase());
        fsReadFileAsync(filepath).then(content => processContent(content.toString()), error);

}

const processContent = (inputStream) => {
    let stream = inputStream;

    if (args.uncompress) {
        let gunzipStream = zlib.createGunzip();
        stream = stream.pipe(gunzipStream);
    }

    let upper = new Transform({
        transform(chunk, encoding, done) {
            this.push(chunk.toString().toUpperCase());
            setTimeout(done,600);
        }
    });

    stream = stream.pipe(upper);

    if (args.compress) {
        OUTFILEPATH = `${OUTFILEPATH}.gz`
        let gzipStream = zlib.createGzip();
        stream = stream.pipe(gzipStream);
    }

    let outputStream;
    if(args.out) {
        outputStream = process.stdout;
    } else {
        outputStream = fs.createWriteStream(OUTFILEPATH, "utf-8")
    }

    stream.pipe(outputStream);
}

if (process.argv.length <= 2 || args.help) {
    printHelp();
} else if (args.in || args._.includes("-")) {
    processContent(process.stdin);
} else if (args.file) {
    processContent(fs.createReadStream(path.join(BASEFILEPATH, args.file)));
} else {
    error("Incorrect usage", true);
}

// process.exit();
