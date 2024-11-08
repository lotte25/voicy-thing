import Ffmpeg from "fluent-ffmpeg";

function mergeFiles(output) {
    return new Promise((resolve, reject) => {
        Ffmpeg()
        .input("merge_list.txt")
        .inputOptions("-f", "concat", "-safe", "0")
        .outputOptions("-c", "copy")
        .output(output)
        .on("end", () => {
            console.log("Files merged successfully.");
            resolve();
        })
        .on("error", (err) => {
            console.error("Error merging files...");
            reject(err);
        })
        .run();
    });
};

mergeFiles("output.ts").then(() => {
    console.log("yay!");
});