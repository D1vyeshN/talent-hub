import { readFileSync, writeFileSync } from "fs";
const f = "src/components/dashboard/RecruiterSidebar.tsx";
let src = readFileSync(f, "utf8");
const oldStr = '{"company" in (user as any) ? (user as any).company : "Recruiter"}';
const newStr = '{user?.role === "recruiter" ? (user as any).company : "Recruiter"}';
if (!src.includes(oldStr)) {
  console.log("NotFound");
  process.exit(1);
}
writeFileSync(f, src.replace(oldStr, newStr));
console.log("Patched");
