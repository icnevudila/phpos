const fs = require('fs');
const path = require('path');

function toReadable(key) {
  // e.g. "pages.reportbuilder.livepreview" -> "Live Preview"
  const parts = key.split('.');
  const last = parts[parts.length - 1];
  
  // Custom overrides
  if (last === 'preparingWorkspace') return 'Preparing workspace...';
  if (last === 'livepreview') return 'Live Preview';
  if (last === 'refresh') return 'Refresh';
  if (last === 'syncInterrupted') return 'Sync Interrupted';
  if (last === 'loadingPatientRecords') return 'Loading patient records...';
  if (last === 'loadingAppointments') return 'Loading appointments...';
  if (last === 'preparingInvoice') return 'Preparing invoice...';
  if (last === 'syncingClinicData') return 'Syncing clinic data...';
  if (last === 'buildingReportPreview') return 'Building report preview...';
  if (last === 'loadingInventory') return 'Loading inventory...';
  if (last === 'openingPatientTerminal') return 'Opening patient terminal...';
  
  // Convert camelCase to Title Case
  const result = last.replace(/([A-Z])/g, ' $1').trim();
  return result.charAt(0).toUpperCase() + result.slice(1);
}

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  // Regex to find t("...") or t('...')
  // but only if it's not already followed by a comma (which means it might have options like defaultValue)
  // This is a bit tricky, let's just replace all t("key") with t("key", { defaultValue: "Readable Key" })
  // We match t("some.key") or t('some.key') where it is followed directly by a closing parenthesis
  const regex = /t\((['"])([\w\.]+)\1\)/g;
  
  content = content.replace(regex, (match, quote, key) => {
    modified = true;
    const readable = toReadable(key);
    return `t(${quote}${key}${quote}, { defaultValue: "${readable}" })`;
  });

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${filePath}`);
  }
}

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walkDir(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      processFile(fullPath);
    }
  }
}

walkDir(path.join(__dirname, 'src'));
console.log("Done fixing i18n keys.");
