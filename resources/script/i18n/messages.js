/* Parseo y formateo de mensajes. */

export function parseProperties(text) {
  const messages = {};
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#") || line.startsWith("!")) continue;
    const separator = line.indexOf("=");
    if (separator === -1) continue;
    const key = line.slice(0, separator).trim();
    const value = line.slice(separator + 1).trim()
      .replace(/\\n/g, "\n")
      .replace(/\\t/g, "\t");
    messages[key] = value;
  }
  return messages;
}

export function formatMessage(text, params) {
  if (!params) return text;
  return text.replace(/\{(\w+)\}/g, (match, name) =>
    Object.prototype.hasOwnProperty.call(params, name) ? String(params[name]) : match
  );
}
