const fs = require('fs');
const path = require('path');

const replacements = [
  {
    file: "src/components/patient/PatientHeader.tsx",
    search: /defaultValue: "Print Success"/g,
    replace: 'defaultValue: "Demo mode: print job simulated. No hardware was contacted."'
  },
  {
    file: "src/pages/InventoryPage.tsx",
    search: /defaultValue: "Print Sent"/g,
    replace: 'defaultValue: "Demo mode: print job simulated. No hardware was contacted."'
  },
  {
    file: "src/pages/InvoicePage.tsx",
    search: /defaultValue: "Toast Claim Submitted"/g,
    replace: 'defaultValue: "Demo mode: claim transmission simulated."'
  },
  {
    file: "src/pages/InvoicePage.tsx",
    search: /defaultValue: "Paid Just Now"/g,
    replace: 'defaultValue: "Demo mode: payment recorded locally. No live gateway was charged."'
  },
  {
    file: "src/pages/WaitlistPage.tsx",
    search: /defaultValue: "Toast Added"/g,
    replace: 'defaultValue: "Demo mode: SMS dispatch simulated. No message was sent."'
  }
];

function patchFiles() {
  const dir = path.join(__dirname, 'src');
  for (const rep of replacements) {
    const fullPath = path.join(__dirname, rep.file);
    if (fs.existsSync(fullPath)) {
      let content = fs.readFileSync(fullPath, 'utf8');
      if (content.match(rep.search)) {
        content = content.replace(rep.search, rep.replace);
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Patched ${rep.file}`);
      } else {
        console.log(`Did not find match in ${rep.file}`);
      }
    } else {
      console.log(`File not found: ${rep.file}`);
    }
  }
}

patchFiles();
