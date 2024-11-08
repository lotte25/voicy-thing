import { mkdirSync, readFileSync, writeFileSync } from "fs"
import readline from "readline";
import { setTimeout } from "timers/promises";

Function.prototype.safeNew = function (...args) {
    try {
        return [new this(...args), null];
    } catch (why) {
        return [null, why];
    };
};

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const answer = await ask("Enter your m3u8 url: ");

const [parsed, err] = URL.safeNew(answer);
if (err) {
    throw new Error("Please enter a valid Voicy m3u8 URL!")
};

const req = await request(parsed.href);

if (!req) {
    throw new Error("oopsie doopsie");
};

const chunks = (await req.text())
    .replace(/\r/g, "")
    .split("\n")
    .filter(s => s.endsWith(".ts"));

const id = answer.split("/")[8];

add(id);

// Create merge file for ffmpeg
mkdirSync(`chunks/${id}/`, { recursive: true });

writeFileSync(`lists/${id}.txt`, chunks.map(filename => `file chunks/${id}/${filename}`).join("\n"));

for (const chunk of chunks) {
    await downloadAndSave(chunk);
    console.log(`${chunk} downloaded.`);
    await setTimeout(500);
};

async function request(url) {
    try {
        const req = await fetch(url, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:132.0) Gecko/20100101 Firefox/132.0",
                "Host": "files.voicy.jp",
                "Origin": "https://voicy.jp",
                "Referer": "https://voicy.jp/",
                "Accept-Encoding": "gzip, deflate, br, zstd",
                "Authorization": "Bearer eyJhbGciOiJSUzI1NiIsImtpZCI6ImI4Y2FjOTViNGE1YWNkZTBiOTY1NzJkZWU4YzhjOTVlZWU0OGNjY2QiLCJ0eXAiOiJKV1QifQ.eyJwcm92aWRlcl9pZCI6ImFub255bW91cyIsImlzcyI6Imh0dHBzOi8vc2VjdXJldG9rZW4uZ29vZ2xlLmNvbS92bWVkaWEtcHJvZCIsImF1ZCI6InZtZWRpYS1wcm9kIiwiYXV0aF90aW1lIjoxNzMxMDE3MDQ2LCJ1c2VyX2lkIjoic2ZYRUV5d2FCTlpQVTZDQTFJdEd1MDI1TVZhMiIsInN1YiI6InNmWEVFeXdhQk5aUFU2Q0ExSXRHdTAyNU1WYTIiLCJpYXQiOjE3MzEwMTcwNDYsImV4cCI6MTczMTAyMDY0NiwiZmlyZWJhc2UiOnsiaWRlbnRpdGllcyI6e30sInNpZ25faW5fcHJvdmlkZXIiOiJhbm9ueW1vdXMifX0.XiXoRacp9Y_tPvugmYxl43QpRE5Fzd9BA1gBx5YMZtfJOpxaNhK-6ZJZlOFQ9t5eUTRAzFQc7vrAxw4zcR3X0HOdbb-acv-65kCuZC1PSSE8hJ-zquszoZ7ahsGQ36-dr4BL9af6YH-gRtXUY_IF6_SMFYLM9Ob4y9i6JhW_XUt5_7DolQS0nDPZigu2swLuHQ1XK_ikUODLbNvec0abDD8XB7YL7pL6QTG-8EpCwx99it2QVK-yHJzQ0mHlUStM8oY_tobm_ERLbwYMhZ42JLcNsMrKhao5rCAmQwiRf_6tp8YsxHkQ3X5uX_EnjVmycmAoflF06j849USoa-WUTA",
                "Accept": "*/*"
            }
        });

        if (!req.ok) {
            return;
        };

        return req;
    } catch (error) {
        console.error(error);
    };
};

function add(anything) {
    const json = JSON.parse(readFileSync("db.json"));

    json.push(anything);

    writeFileSync("db.json", JSON.stringify(json, null, 4));
};

async function ask(question) {
    return await new Promise((resolve) => rl.question(question, resolve));
};

async function downloadAndSave(filename) {
    try {
        const req = await request(`https://files.voicy.jp/voice/hls/2018/03/30/0dc851036c7edb8439b99908909c7e83/${filename}`);
        if (req.ok) {
            const buffer = await req.arrayBuffer();
            writeFileSync(`chunks/${id}/${filename}`, Buffer.from(buffer, "binary"));
        }
    } catch (error) {
        console.error(error);
    }
};