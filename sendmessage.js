const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const axios = require('axios');
const readline = require('readline');

const webhookUrl = process.env.DISCORD_WEBHOOK_URL;

if (!webhookUrl) {
    console.error('Error: DISCORD_WEBHOOK_URL is not defined in .env');
    process.exit(1);
}

const rl = readline.createInterface({
    input: process.stdin,
    terminal: false
});

let output = '';

rl.on('line', (line) => {
    // Print build output to terminal so we can see it
    console.log(line);
    output += line + '\n';
});

rl.on('close', async () => {
    console.log('Build finished. Sending notification...');
    
    // Improved success detection
    const isSuccess = output.includes('BUILD SUCCESSFUL') || 
                      output.includes('Build successful') || 
                      (output.toLowerCase().includes('success') && !output.toLowerCase().includes('failed'));
    
    const status = isSuccess ? '✅ Success' : '❌ Failed';
    
    const message = {
        embeds: [{
            title: `Build Notification: ${status}`,
            description: `**Build Output Summary:**\n\`\`\`\n${output.slice(-1500) || 'No output recorded'}\n\`\`\``,
            color: isSuccess ? 3066993 : 15158332, // Green for success, Red for failure
            timestamp: new Date().toISOString()
        }]
    };

    try {
        await axios.post(webhookUrl, message);
        console.log('Discord notification sent successfully.');
    } catch (err) {
        console.error('Failed to send Discord notification:', err.message);
    }
});
