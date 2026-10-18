const crypto = require("crypto");

const keys = {
  prueba: "221ed8f716a56d0b9369aba65e57f5c1a20af0bb5285fbae2cc98634c19489be",
  productivo: "221ed8f716a56d0b9369aba65e57f5c1a20af0bb5285fbae2cc98634c19489be",
};

const manifest = "id:183780669703;request-id:800f3456-30b9-9ea8-ad2f-97d7fab5e824;ts:1792302090;";

for (const [name, key] of Object.entries(keys)) {
  const hash = crypto.createHmac("sha256", key.trim()).update(manifest).digest("hex");
  console.log(name, "->", hash.slice(0, 8), hash.startsWith("85e34e66") ? "  <-- ESTA ES" : "");
}