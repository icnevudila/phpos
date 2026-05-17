/**
 * Zebra Print Service
 * Communicates with Zebra Browser Print (localhost:9100) to send ZPL commands.
 */

const LOCAL_ZEBRA_URL = "http://localhost:9100";

export interface ZebraLabelData {
  patientName: string;
  patientId: string;
  date: string;
  clinicName: string;
  type: "PATIENT_ID" | "LAB_CASE" | "PRESCRIPTION";
}

export interface InventoryLabelData {
  itemName: string;
  itemId: string;
  category: string;
  clinicName: string;
  expiry?: string | null;
}

/**
 * Generates ZPL code for a patient ID label.
 */
function generatePatientLabelZPL(data: ZebraLabelData): string {
  // Example ZPL for a 2x1 inch label
  return `
^XA
^CI28
^CF0,30
^FO50,50^FD${data.clinicName}^FS
^CF0,40
^FO50,100^FD${data.patientName}^FS
^CF0,25
^FO50,160^FDID: ${data.patientId}^FS
^FO50,190^FDDate: ${data.date}^FS
^FO350,50^BQN,2,4^FDQA,${data.patientId}^FS
^XZ
  `.trim();
}

function generateInventoryLabelZPL(data: InventoryLabelData): string {
  const exp = data.expiry ? `Exp: ${data.expiry}` : "";
  return `
^XA
^CI28
^CF0,28
^FO40,40^FD${data.clinicName}^FS
^CF0,36
^FO40,85^FD${data.itemName}^FS
^CF0,22
^FO40,135^FDCat: ${data.category}^FS
^FO40,165^FDID: ${data.itemId}^FS
^FO40,195^FD${exp}^FS
^FO320,50^BQN,2,4^FDQA,INV-${data.itemId}^FS
^XZ
  `.trim();
}

/**
 * Sends ZPL to the local Zebra printer via Browser Print.
 */
export async function printZebraLabel(data: ZebraLabelData): Promise<boolean> {
  const zpl = generatePatientLabelZPL(data);
  
  try {
    // 1. Get default printer
    const devicesRes = await fetch(`${LOCAL_ZEBRA_URL}/available`, { method: "GET" });
    const devices = await devicesRes.json();
    
    const printer = devices.printer?.find((p: any) => p.uid !== undefined) || devices.printer?.[0];
    
    if (!printer) {
      console.warn("No Zebra printer found via Browser Print.");
      return false;
    }

    // 2. Send ZPL to the printer
    const res = await fetch(`${LOCAL_ZEBRA_URL}/write`, {
      method: "POST",
      body: JSON.stringify({
        device: { uid: printer.uid },
        data: zpl
      })
    });

    return res.ok;
  } catch (error) {
    console.error("Zebra Print Error:", error);
    // Fallback: Notify user to ensure Zebra Browser Print is running
    return false;
  }
}

/**
 * Fallback to browser print if Zebra is unavailable.
 */
export async function printInventoryLabel(data: InventoryLabelData): Promise<boolean> {
  const zpl = generateInventoryLabelZPL(data);
  try {
    const devicesRes = await fetch(`${LOCAL_ZEBRA_URL}/available`, { method: "GET" });
    const devices = await devicesRes.json();
    const printer = devices.printer?.find((p: { uid?: string }) => p.uid !== undefined) || devices.printer?.[0];
    if (!printer) return false;
    const res = await fetch(`${LOCAL_ZEBRA_URL}/write`, {
      method: "POST",
      body: JSON.stringify({ device: { uid: printer.uid }, data: zpl }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export function printInventoryFallback(data: InventoryLabelData): void {
  const printWindow = window.open("", "_blank");
  if (!printWindow) return;
  printWindow.document.write(`
    <html><head><title>Inventory label</title></head>
    <body style="font-family:sans-serif;text-align:center;padding:20px">
      <h2>${data.clinicName}</h2>
      <p><strong>${data.itemName}</strong></p>
      <p>${data.category} · ${data.itemId}</p>
      ${data.expiry ? `<p>Exp: ${data.expiry}</p>` : ""}
      <script>window.print();window.close();</script>
    </body></html>
  `);
  printWindow.document.close();
}

export function printFallback(data: ZebraLabelData): void {
  const printWindow = window.open("", "_blank");
  if (!printWindow) return;

  printWindow.document.write(`
    <html>
      <head>
        <title>Label Print Fallback</title>
        <style>
          body { font-family: sans-serif; padding: 20px; text-align: center; }
          .label { border: 1px solid #ccc; padding: 20px; display: inline-block; width: 300px; }
          h2 { margin: 0 0 10px 0; font-size: 18px; }
          p { margin: 5px 0; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="label">
          <h2>${data.clinicName}</h2>
          <p><strong>${data.patientName}</strong></p>
          <p>ID: ${data.patientId}</p>
          <p>Date: ${data.date}</p>
        </div>
        <script>window.print(); window.close();</script>
      </body>
    </html>
  `);
  printWindow.document.close();
}
