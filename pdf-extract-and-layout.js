// Required: npm install pdf-lib csv-parse fs-extra
import fs from "fs-extra";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { parse } from "csv-parse/sync";

/**
 * Extracts specific pages from a PDF.
 * @param {Uint8Array|ArrayBuffer|Buffer} pdfBytes - The PDF file bytes.
 * @param {number[]} pageNumbers - Array of 1-based page numbers to extract.
 * @returns {Promise<import("pdf-lib").PDFDocument>} A new PDFDocument with the extracted pages.
 */
async function extractPages(pdfBytes, pageNumbers) {
  const srcPdf = await PDFDocument.load(pdfBytes);
  const newPdf = await PDFDocument.create();
  for (const num of pageNumbers) {
    const [copied] = await newPdf.copyPages(srcPdf, [num - 1]);
    newPdf.addPage(copied);
  }
  return newPdf;
}

/**
 * Arranges PDF pages 4 per A4 sheet.
 * @param {import("pdf-lib").PDFDocument} pdfDoc - The PDFDocument to layout.
 * @param {string} name - Optional name to print on the first sheet.
 * @returns {Promise<import("pdf-lib").PDFDocument>} The new PDFDocument with arranged layout.
 */
async function layoutFourPerSheet(pdfDoc, name) {
  const pages = pdfDoc.getPages();
  const total = pages.length;
  const outPdf = await PDFDocument.create();
  const font = await outPdf.embedFont(StandardFonts.HelveticaBold);

  // Portrait A4 size
  const pageWidth = 595.28;
  const pageHeight = 841.89;
  // 2x2 grid
  const positions = [
    [0, pageHeight / 2],
    [pageWidth / 2, pageHeight / 2],
    [0, 0],
    [pageWidth / 2, 0],
  ];
  const cellWidth = pageWidth / 2 - 20;
  const cellHeight = pageHeight / 2 - 20;

  for (let i = 0; i < total; i += 4) {
    const sheet = outPdf.addPage([pageWidth, pageHeight]);
    for (let j = 0; j < 4 && i + j < total; j++) {
      const [embedded] = await outPdf.embedPages([pages[i + j]]);
      sheet.drawPage(embedded, {
        x: positions[j][0] + 10,
        y: positions[j][1] + 10,
        width: cellWidth,
        height: cellHeight,
      });
    }
    if (i === 0 && name) {
      sheet.drawText(name, {
        x: (pageWidth - font.widthOfTextAtSize(name, 24)) / 2,
        y: pageHeight - 25,
        size: 24,
        font,
        color: rgb(0, 0, 0),
      });
    }
  }
  return outPdf;
}

/**
 * Main CLI function.
 * @param {string} csvPath - Path to the CSV file.
 * @param {string} pdfPath - Path to the source PDF file.
 * @param {string} outputPath - Path to write the output PDF.
 * @param {number} [rowIndex=0] - Index of the CSV row to use.
 * @returns {Promise<void>}
 */
async function main(csvPath, pdfPath, outputPath, rowIndex = 0) {
  const csvData = await fs.readFile(csvPath, "utf8");
  const records = parse(csvData, {
    columns: true,
    skip_empty_lines: true,
    delimiter: ";",
  });

  // Use the specified row (default 0)
  const row = records[rowIndex];
  const name = row.name;
  const numbers = row.pages
    .split(",")
    .map((s) => parseInt(s.trim(), 10))
    .filter((n) => !isNaN(n));

  const pdfBytes = await fs.readFile(pdfPath);
  const extracted = await extractPages(pdfBytes, numbers);
  const laidOut = await layoutFourPerSheet(extracted, name);
  const outBytes = await laidOut.save();
  await fs.writeFile(outputPath, outBytes);
}

if (
  process.argv[1] &&
  process.argv[1].endsWith("pdf_extract_and_layout.js") &&
  process.argv.length === 5
) {
  main(process.argv[2], process.argv[3], process.argv[4]);
}

export { extractPages, layoutFourPerSheet, main };
