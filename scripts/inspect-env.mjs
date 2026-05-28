console.log("Environment variables matching filters:");
for (const key of Object.keys(process.env)) {
  if (key.toLowerCase().includes("pass") || key.toLowerCase().includes("db") || key.toLowerCase().includes("supabase") || key.toLowerCase().includes("key")) {
    console.log(`- ${key}: ${process.env[key] ? "[SET]" : "[EMPTY]"}`);
  }
}
