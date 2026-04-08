# HRMS Sync Tool

A Node.js based bidirectional synchronization tool that keeps a local folder in sync with a Google Drive (or any rclone compatible) remote.

## Features
- **Bidirectional Sync**: Uses `rclone bisync` to ensure changes on both local and remote are synchronized.
- **Real-time Monitoring**: Uses `chokidar` to detect local file changes and trigger an immediate sync.
- **Periodic Polling**: Automatically checks the remote for changes at a configurable interval.
- **Conflict Resolution**: Handles synchronization conflicts based on the latest modification time.

## Prerequisites
- [Node.js](https://nodejs.org/) (v14+)
- [rclone](https://rclone.org/) (v1.58+) configured with a remote (e.g., `drive:`)

## Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/mk1121/hrms-sync-tool.git
   cd hrms-sync-tool
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Environment Configuration**:
   Create a `.env` file in the root of the `sync-tool` directory:
   ```env
   # Rclone Configuration
   RCLONE_REMOTE=drive:hrms        # Your rclone remote and path
   SYNC_INTERVAL_MS=60000          # Interval to check for remote changes (1 min)

   # Directory Configuration
   WATCH_FOLDER=../output          # Local folder to monitor
   ```

## Usage

Start the synchronization tool:
```bash
node index.js
```

The first run will perform an initial `--resync` to establish the synchronization database. Subsequent runs will only sync changes.

## License
ISC
