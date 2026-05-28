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

  console.log("Searching logs for migration or SQL execution...");
  let count = 0;
  for await (const line of rl) {
    if (line.includes('migration') || line.includes('.sql') || line.includes('SQL')) {
      // Parse JSON line to get step index and brief content
      try {
        const obj = JSON.parse(line);
        console.log(`[Step ${obj.step_index}] ${obj.type} - Source: ${obj.source}`);
        if (obj.tool_calls) {
          console.log("  Tool Calls:", JSON.stringify(obj.tool_calls, null, 2));
        }
        if (obj.content && obj.content.length < 300) {
          console.log("  Content:", obj.content);
        }
      } catch (e) {
        console.log("  Line match (raw):", line.slice(0, 200));
      }
      count++;
      if (count > 50) {
        console.log("Too many matches, truncating...");
        break;
      }
    }
  }
}

searchLog().catch(console.error);
