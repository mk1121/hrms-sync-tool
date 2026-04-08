require('dotenv').config();
const chokidar = require('chokidar');
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

const watchFolder = path.resolve(__dirname, process.env.WATCH_FOLDER || '../output');
const rcloneRemote = process.env.RCLONE_REMOTE || 'drive:hrms';
const pollInterval = parseInt(process.env.SYNC_INTERVAL_MS, 10) || 60000;

// Ensure watch folder exists
if (!fs.existsSync(watchFolder)) {
    console.log(`Creating folder: ${watchFolder}`);
    fs.mkdirSync(watchFolder, { recursive: true });
}

console.log(`Watching folder: ${watchFolder}`);
console.log(`Bidirectional sync with: ${rcloneRemote}`);

let syncInProgress = false;
let syncQueued = false;

const runSync = (isInitial = false) => {
    if (syncInProgress) {
        syncQueued = true;
        return;
    }

    syncInProgress = true;
    syncQueued = false;

    console.log(`[${new Date().toLocaleTimeString()}] Running bisync...`);
    
    const resyncFlag = isInitial ? '--resync' : '';
    const command = `rclone bisync "${watchFolder}" "${rcloneRemote}" ${resyncFlag} --verbose`;

    exec(command, (error, stdout, stderr) => {
        syncInProgress = false;
        
        if (error) {
            if (stderr && stderr.includes('resync required')) {
                console.log('Bisync requires initialization. Running with --resync...');
                runSync(true);
                return;
            }
            console.error(`Sync error: ${error.message}`);
            if (stderr) console.log(`Stderr: ${stderr}`);
        }
        
        console.log(`[${new Date().toLocaleTimeString()}] Sync completed.`);

        if (syncQueued) {
            runSync();
        }
    });
};

// Initialize watcher for local changes
const watcher = chokidar.watch(watchFolder, {
    persistent: true,
    ignoreInitial: true,
    awaitWriteFinish: {
        stabilityThreshold: 1000,
        pollInterval: 100
    }
});

watcher.on('all', (event, filePath) => {
    console.log(`Local Event: ${event} on ${filePath}`);
    runSync();
});

// Periodic poll for remote changes
setInterval(() => {
    console.log('Checking for remote changes...');
    runSync();
}, pollInterval);

// Initial run
runSync(true);

console.log('Sync tool is running (Bidirectional)...');
