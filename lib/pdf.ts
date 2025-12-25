import type PDFKit from 'pdfkit';
import { createRequire } from 'module';
import type { Readable } from 'stream';

const require = createRequire(import.meta.url);

function getPDFDocumentCtor(): any {
  // Important: require dynamique pour éviter que Turbopack/SWC bundle pdfkit/fontkit.
  return require('pdfkit');
}

export function generateContractPdf(data: {
  client: { nom: string; prenom?: string };
  vehicle: { modele: string; immatriculation: string };
  dates: { debut: Date; fin: Date };
  montant: number;
  caution?: number;
  signatureClient?: string;
}) {
  const PDFDocument = getPDFDocumentCtor();
  const doc = new PDFDocument();
  doc.fontSize(18).text('AutoRent Maroc', { align: 'center' });
  doc.fontSize(14).text('Contrat de location', { align: 'center' });
  doc.moveDown();
  doc.fontSize(12).text(`Client: ${data.client.prenom ?? ''} ${data.client.nom}`);
  doc.text(`Véhicule: ${data.vehicle.modele} (${data.vehicle.immatriculation})`);
  doc.text(`Période: ${data.dates.debut.toLocaleString()} - ${data.dates.fin.toLocaleString()}`);
  doc.text(`Montant: ${data.montant} MAD`);
  if (data.caution !== undefined) doc.text(`Caution: ${data.caution} MAD`);
  doc.moveDown();
  doc.text('Clauses principales:', { underline: true });
  doc.text('- Assurance incluse selon police en vigueur.');
  doc.text('- Carburant au retour identique au départ.');
  doc.text('- Retards facturés par tranche horaire entamée.');
  doc.text('- Infractions routières à la charge du locataire.');
  doc.moveDown();
  doc.text('Signatures:', { underline: true });
  if (data.signatureClient) {
    doc.text('Client (e-sign) :');
    doc.image(data.signatureClient, { fit: [200, 80] });
  } else {
    doc.text('Client: ________________________');
  }
  doc.text('Agence: ________________________');
  doc.end();
  return doc;
}

export function streamToBuffer(stream: PDFKit.PDFDocument | Readable): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    stream.on('data', (chunk: Buffer) => chunks.push(chunk));
    stream.on('end', () => resolve(Buffer.concat(chunks)));
    stream.on('error', reject);
  });
}
