import { PDFDocument } from "pdf-lib";

/**
 * Extracts specific pages from a PDF.
 * @param pdfBytes The PDF file bytes.
 * @param pageNumbers Array of 1-based page numbers to extract.
 * @returns A new PDFDocument with the extracted pages.
 */
export function extractPages(
  pdfBytes: Uint8Array | ArrayBuffer | Buffer,
  pageNumbers: number[]
): Promise<PDFDocument>;

/**
 * Arranges PDF pages 4 per A4 sheet.
 * @param pdfDoc The PDFDocument to layout.
 * @param name Optional name to print on the first sheet.
 * @returns The new PDFDocument with arranged layout.
 */
export function layoutFourPerSheet(
  pdfDoc: PDFDocument,
  name: string
): Promise<PDFDocument>;

/**
 * Main CLI function.
 */
export function main(
  csvPath: string,
  pdfPath: string,
  outputPath: string,
  rowIndex?: number
): Promise<void>;
