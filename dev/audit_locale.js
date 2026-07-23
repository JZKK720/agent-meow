// Audits EN vs ZH coverage in web/src/lib/locales/*.json
const fs = require("node:fs");
const path = require("node:path");

const en = JSON.parse(fs.readFileSync("web/src/lib/locales/en.json", "utf8"));
const zh = JSON.parse(fs.readFileSync("web/src/lib/locales/zh-CN.json", "utf8"));

function flatten(obj, prefix = "") {
  const out = {};
  for (const k of Object.keys(obj)) {
    const v = obj[k];
    const key = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === "object" && !Array.isArray(v)) {
      Object.assign(out, flatten(v, key));
    } else {
      out[key] = v;
    }
  }
  return out;
}

const enFlat = flatten(en);
const zhFlat = flatten(zh);

const enKeys = new Set(Object.keys(enFlat));
const zhKeys = new Set(Object.keys(zhFlat));

const missingInZh = [...enKeys].filter((k) => !zhKeys.has(k));
const missingInEn = [...zhKeys].filter((k) => !enKeys.has(k));

console.log(`EN keys: ${enKeys.size}`);
console.log(`ZH keys: ${zhKeys.size}`);
console.log(`Missing in ZH (EN has, ZH does not): ${missingInZh.length}`);
console.log(`Extra in ZH (ZH has, EN does not): ${missingInEn.length}`);

const topSectionsEn = Object.keys(en);
const topSectionsZh = Object.keys(zh);
console.log("\nEN top sections:", topSectionsEn.join(", "));
console.log("ZH top sections:", topSectionsZh.join(", "));
console.log("\nSections in EN but not in ZH:", topSectionsEn.filter((s) => !topSectionsZh.includes(s)));
console.log("Sections in ZH but not in EN:", topSectionsZh.filter((s) => !topSectionsEn.includes(s)));

console.log("\n--- Sample missing in ZH (first 40) ---");
console.log(missingInZh.slice(0, 40).join("\n"));
console.log("\n--- Sample missing in EN (first 20) ---");
console.log(missingInEn.slice(0, 20).join("\n"));

// Detect "untranslated" (literal English string still in ZH)
const enValues = Object.fromEntries(Object.entries(enFlat).map(([k, v]) => [k, String(v)]));
const enValuesSet = new Set(Object.values(enValues));
const untranslated = [];
for (const k of missingInZh.length ? [] : []) break; // skip
const untranslatedReal = [];
for (const [k, v] of Object.entries(zhFlat)) {
  const s = String(v);
  if (enValuesSet.has(s) && s.length > 8) {
    untranslatedReal.push(`${k} = ${s.slice(0, 60)}`);
  }
}
console.log(`\nUntranslated (literal EN string in zh-CN): ${untranslatedReal.length}`);
console.log(untranslatedReal.slice(0, 20).join("\n"));
