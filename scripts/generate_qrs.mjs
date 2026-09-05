import fs from 'fs';
import path from 'path';
import QRCode from 'qrcode';
import JSZip from 'jszip';

const outputDir = path.join(process.cwd(), 'public', 'qr-codes');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Use command line argument or environment variable, defaulting to active development URL
const BASE_URL = process.argv[2] || process.env.BASE_URL || 'https://ais-dev-6lajhjqfy7vryrbl5juvx6-563603576450.asia-southeast1.run.app';

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

async function generateAllQrs() {
  console.log(`Generating 20 QR codes with Base URL: ${BASE_URL}...`);
  const zip = new JSZip();
  const manifest = [];

  for (const item of teachers) {
    const numStr = item.id < 10 ? '0' + item.id : '' + item.id;
    const targetUrl = `${BASE_URL}/?id=${item.id}`;
    const filename = `QR-${numStr}.png`;
    const filepath = path.join(outputDir, filename);

    // Generate high resolution PNG (width 600px with high error correction)
    const pngBuffer = await QRCode.toBuffer(targetUrl, {
      width: 600,
      margin: 2,
      errorCorrectionLevel: 'H',
      color: {
        dark: '#050B18',
        light: '#FFFFFF'
      }
    });

    fs.writeFileSync(filepath, pngBuffer);
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

    console.log(`✓ Generated ${filename} -> ${targetUrl} (${item.name})`);
  }

  // Create a printable manifest / instructions in the zip
  const readmeContent = `CSE TEACHERS' DAY LIVE HUNT 2026 - QR CODES BUNDLE
=====================================================
Target URL Base: ${BASE_URL}

INSTRUCTIONS FOR ORGANIZERS:
1. Print these 20 QR codes on paper or sticker sheets.
2. Hide/place them around the CSE department labs, classrooms, and seminar spaces.
3. Students and attendees scan with any standard smartphone camera.
4. QRs #01 to #17 will reveal the real faculty tributes with photos, sound fanfare & confetti!
5. QRs #18, #19, and #20 are decoy markers ("Oops! Lost your chance").

QR CODES LIST:
${manifest.map(m => `[#${m.number}] ${m.type.toUpperCase()}: ${m.name} -> ${m.targetUrl}`).join('\n')}
`;

  zip.file('README-HUNT-INSTRUCTIONS.txt', readmeContent);
  zip.file('manifest.json', JSON.stringify(manifest, null, 2));

  // Write zip file
  const zipBuffer = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
  const zipPath = path.join(outputDir, 'cse-hunt-all-20-qrs.zip');
  fs.writeFileSync(zipPath, zipBuffer);
  console.log(`✓ Successfully bundled all 20 QRs into ${zipPath} (${(zipBuffer.length / 1024).toFixed(1)} KB)`);

  // Write manifest.json to public/qr-codes/manifest.json
  fs.writeFileSync(path.join(outputDir, 'manifest.json'), JSON.stringify(manifest, null, 2));
}

generateAllQrs().catch(err => {
  console.error('Error generating QRs:', err);
  process.exit(1);
});
