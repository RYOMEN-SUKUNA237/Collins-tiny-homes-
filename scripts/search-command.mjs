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

  console.log("Searching logs for commands containing db:migrate or migrate-db...");
  for await (const line of rl) {
    try {
      const obj = JSON.parse(line);
      if (obj.type === 'run_command' || obj.type === 'PLANNER_RESPONSE' || obj.type === 'USER_INPUT') {
        const text = JSON.stringify(obj);
        if (text.includes('db:migrate') || text.includes('migrate-db')) {
          console.log(`[Step ${obj.step_index}] ${obj.type} - Source: ${obj.source}`);
          if (obj.tool_calls) {
            console.log("  Tool Calls:", JSON.stringify(obj.tool_calls, null, 2));
          }
          if (obj.content && obj.content.length > 0) {
            console.log("  Content:", obj.content.slice(0, 500));
          }
          if (obj.output && obj.output.length > 0) {
            console.log("  Output:", obj.output.slice(0, 500));
          }
        }
      }
    } catch (e) {
      // ignore
    }
  }
}

searchLog().catch(console.error);
