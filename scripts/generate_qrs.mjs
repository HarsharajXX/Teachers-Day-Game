import fs from 'fs';
import path from 'path';
import QRCode from 'qrcode';
import JSZip from 'jszip';

const outputDir = path.join(process.cwd(), 'public', 'qr-codes');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const PUBLIC_SHARED_URL = 'https://ais-pre-6lajhjqfy7vryrbl5juvx6-563603576450.asia-southeast1.run.app';
const DEV_URL = 'https://ais-dev-6lajhjqfy7vryrbl5juvx6-563603576450.asia-southeast1.run.app';

const teachers = [
  { id: 1, name: "Dr. Uzzal Kr Sharma", role: "Head of Department (HOD)" },
  { id: 2, name: "Dr. Rubul Kumar Baniya", role: "Department Faculty, CSE" },
  { id: 3, name: "Dr. Pranjit Das", role: "Department Faculty, CSE" },
  { id: 4, name: "Dr. Diganta Pathak", role: "Department Faculty, CSE" },
  { id: 5, name: "Dr. Monalisa Hazarika", role: "Department Faculty, CSE" },
  { id: 6, name: "Sikha Moni", role: "Department Faculty, CSE" },
  { id: 7, name: "Prarthana Ma'am", role: "Department Faculty, CSE" },
  { id: 8, name: "Dr. Vivek Thapa", role: "Department Faculty, CSE" },
  { id: 9, name: "Ranjan Saikia", role: "Department Faculty, CSE" },
  { id: 10, name: "Dr. Bikramjit Sarma", role: "Department Faculty, CSE" },
  { id: 11, name: "Bishwajit Dev", role: "Department Faculty, CSE" },
  { id: 12, name: "Dr. Adil Akhtar", role: "Department Faculty, CSE" },
  { id: 13, name: "Bibha Ma'am", role: "Department Faculty, CSE" },
  { id: 14, name: "Liry Teronpi", role: "Department Faculty, CSE" },
  { id: 15, name: "Antariksha Baisa", role: "Department Faculty, CSE" },
  { id: 16, name: "Bedanta Nath", role: "Department Faculty, CSE" },
  { id: 17, name: "Himanshu Saikia", role: "Department Faculty, CSE" },
  { id: 18, name: "Decoy QR Marker A", role: "Decoy Code (Oops! Lost chance)" },
  { id: 19, name: "Decoy QR Marker B", role: "Decoy Code (Oops! Lost chance)" },
  { id: 20, name: "Decoy QR Marker C", role: "Decoy Code (Oops! Lost chance)" }
];

async function generateBundle(baseUrl, bundleName, isDefault = false) {
  console.log(`Generating bundle '${bundleName}' with Base URL: ${baseUrl}...`);
  const zip = new JSZip();
  const manifest = [];

  for (const item of teachers) {
    const numStr = item.id < 10 ? '0' + item.id : '' + item.id;
    const targetUrl = `${baseUrl}/?id=${item.id}`;
    const filename = `QR-${numStr}.png`;

    const pngBuffer = await QRCode.toBuffer(targetUrl, {
      width: 600,
      margin: 2,
      errorCorrectionLevel: 'H',
      color: {
        dark: '#050B18',
        light: '#FFFFFF'
      }
    });

    if (isDefault) {
      fs.writeFileSync(path.join(outputDir, filename), pngBuffer);
    }
    zip.file(filename, pngBuffer);

    manifest.push({
      id: item.id,
      number: numStr,
      name: item.name,
      role: item.role,
      type: item.id <= 17 ? 'Teacher Tribute' : 'Decoy Marker',
      targetUrl,
      file: `/qr-codes/${filename}`
    });
  }

  const readme = `CSE TEACHERS' DAY LIVE HUNT 2026 - QR CODES BUNDLE (${bundleName.toUpperCase()})
========================================================================
Target URL Base: ${baseUrl}

IMPORTANT ACCESS INFORMATION:
- Public Shared URL (ais-pre-...): Accessible to EVERYONE without requiring any login! (Requires clicking "Share" once in AI Studio).
- Dev URL (ais-dev-...): Accessible ONLY by the app creator Google account. Other Google accounts will see "We are sorry, but you do not have access to this page".

SETUP INSTRUCTIONS:
1. Print these 20 QR codes on paper or sticker sheets.
2. Hide/place them around the CSE department labs, classrooms, and seminar spaces.
3. Students and attendees scan with any standard smartphone camera.
4. QRs #01 to #17 will reveal the real faculty tributes with photos, sound fanfare & confetti!
5. QRs #18, #19, and #20 are decoy markers ("Oops! Lost your chance").

QR CODES LIST:
${manifest.map(m => `[#${m.number}] ${m.type.toUpperCase()}: ${m.name} -> ${m.targetUrl}`).join('\n')}
`;

  zip.file('README-HUNT-INSTRUCTIONS.txt', readme);
  zip.file('manifest.json', JSON.stringify(manifest, null, 2));

  const zipBuffer = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
  const zipFilename = `cse-hunt-${bundleName}-qrs.zip`;
  fs.writeFileSync(path.join(outputDir, zipFilename), zipBuffer);
  console.log(`✓ Saved ${zipFilename} (${(zipBuffer.length / 1024).toFixed(1)} KB)`);

  if (isDefault) {
    fs.writeFileSync(path.join(outputDir, 'cse-hunt-all-20-qrs.zip'), zipBuffer);
    fs.writeFileSync(path.join(outputDir, 'manifest.json'), JSON.stringify(manifest, null, 2));
    console.log(`✓ Saved default cse-hunt-all-20-qrs.zip`);
  }
}

async function run() {
  // Generate public shared bundle (Primary for students & all accounts)
  await generateBundle(PUBLIC_SHARED_URL, 'public-shared', true);
  // Generate private dev bundle (For owner private testing)
  await generateBundle(DEV_URL, 'dev-private', false);
  console.log('✓ All QR bundles successfully created!');
}

run().catch(err => {
  console.error('Error generating QRs:', err);
  process.exit(1);
});
