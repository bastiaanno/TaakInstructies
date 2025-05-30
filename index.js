/**
 * PDF Generation and Merging Tool
 *
 * This script processes a CSV file and a PDF template to generate personalized PDF files.
 *
 * Usage:
 *   node index.js input.csv input.pdf output_dir_or_file
 *
 * - input.csv: CSV file with data records (semicolon-delimited, with a 'name' column).
 * - input.pdf: PDF template file.
 * - output_dir_or_file:
 *     - If the CSV contains a single record, this is the output PDF file.
 *     - If the CSV contains multiple records, this is the output directory for generated PDFs.
 *       All generated PDFs will be saved here, and a merged PDF ("merged.pdf") will also be created.
 *
 * Features:
 * - Generates a PDF for each record in the CSV using the provided template.
 * - Output filenames are based on the 'name' field in the CSV.
 * - If multiple PDFs are generated, they are concatenated into a single merged PDF.
 *
 * Dependencies:
 * - pdf-lib
 * - fs-extra
 * - csv-parse/sync
 *
 * The main PDF generation logic is delegated to the 'main' function in pdf_extract_and_layout.js.
 */

import fs from "fs-extra";
import { parse } from "csv-parse/sync";
import { PDFDocument } from "pdf-lib";
import {
  extractPages,
  layoutFourPerSheet,
  main,
} from "./pdf-extract-and-layout.js";
if (process.argv.length !== 5) {
  console.log("Usage: node index.js input.csv input.pdf output_dir_or_file");
  process.exit(1);
}

const csvPath = process.argv[2];
const pdfPath = process.argv[3];
const outputArg = process.argv[4];

async function concatenatePDFs(pdfPaths, outputFile) {
  const mergedPdf = await PDFDocument.create();
  for (const pdfPath of pdfPaths) {
    const pdfBytes = await fs.readFile(pdfPath);
    const pdf = await PDFDocument.load(pdfBytes);
    const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
    copiedPages.forEach((page) => mergedPdf.addPage(page));
  }
  const mergedBytes = await mergedPdf.save();
  await fs.writeFile(outputFile, mergedBytes);
}

async function runAll() {
  const csvData = await fs.readFile(csvPath, "utf8");
  const records = parse(csvData, {
    columns: true,
    skip_empty_lines: true,
    delimiter: ";",
  });

  // If only one record, treat outputArg as a file, else as a directory
  const isSingle = records.length === 1;
  if (!isSingle) {
    await fs.ensureDir(outputArg);
  }

  const generatedFiles = [];
  for (let i = 0; i < records.length; i++) {
    // Use the row number from the CSV (first column) if present, otherwise use i+1
    const rowNumber =
      records[i].name && records[i].name.match(/^\d+/)
        ? records[i].name.match(/^\d+/)[0]
        : String(i + 1).padStart(2, "0");
    const namePart = records[i].name
      .replace(/^[0-9]+\s*-\s*|\s+/g, "_")
      .replace(/[^a-z0-9_\-]/gi, "");
    const filename = `${rowNumber}_${namePart}.pdf`;
    const outputFile = isSingle ? outputArg : `${outputArg}/${filename}`;
    await main(
      csvPath,
      pdfPath,
      outputFile,
      i // pass row index
    );
    generatedFiles.push(outputFile);
    console.log(`Generated: ${outputFile}`);
  }

  // Concatenate PDFs if multiple records
  if (!isSingle) {
    const mergedPath = fs.lstatSync(outputArg).isDirectory()
      ? `${outputArg}/merged.pdf`
      : outputArg;
    await concatenatePDFs(generatedFiles, mergedPath);
    console.log(`Merged PDF created: ${mergedPath}`);
  }
}

runAll();
export { concatenatePDFs, extractPages, layoutFourPerSheet, main };
