import fs from 'fs';
import readline from 'readline';
import path from 'path';

async function searchLog() {
  const logPath = 'C:\\Users\\RYOMEN SUKUNA\\.gemini\\antigravity\\brain\\3d19b28e-5e42-4b27-9a3c-3f841a1f550e\\.system_generated\\logs\\transcript.jsonl';
  const fileStream = fs.createReadStream(logPath);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  console.log("Searching logs for db:migrate or migrate-db...");
  for await (const line of rl) {
    if (line.includes('db:migrate') || line.includes('migrate-db')) {
      try {
        const obj = JSON.parse(line);
        console.log(`[Step ${obj.step_index}] ${obj.type} - Source: ${obj.source}`);
        if (obj.tool_calls) {
          console.log("Tool calls:", JSON.stringify(obj.tool_calls, null, 2));
        }
        if (obj.content && obj.content.length > 0) {
          console.log("Content:", obj.content.slice(0, 1000));
        }
      } catch (e) {
        console.log("Failed to parse JSON, raw line starts with:", line.slice(0, 200));
      }
    }
  }
}

searchLog().catch(console.error);
