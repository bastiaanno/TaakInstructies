# TaakInstructies PDF Generation Tool

This tool generates personalized PDF files from a CSV data file and a PDF template. It can also merge the generated PDFs into a single file.

## Features

- Generates a PDF for each record in the CSV using a provided PDF template.
- Output filenames are based on the `number`, `name` and `pages` fields in the CSV.
- If multiple PDFs are generated, they are concatenated into a single merged PDF.
- Supports semicolon-delimited CSV files.

## Requirements

- Node.js (v16+ recommended)
- npm

## Installation

1. Clone this repository.
2. Install dependencies:

   ```sh
   npm install
   ```

## Usage

```sh
node index.js input.csv input.pdf output_dir_or_file
```

- `input.csv`: CSV file with data records (semicolon-delimited, with a `name` column).
- `input.pdf`: PDF template file.
- `output_dir_or_file`:
  - If the CSV contains a single record, this is the output PDF file.
  - If the CSV contains multiple records, this is the output directory for generated PDFs. All generated PDFs will be saved here, and a merged PDF (`merged.pdf`) will also be created.

### Example

```sh
node index.js data.csv template.pdf output/
```

This will generate one PDF per row in `data.csv` using `template.pdf`, save them in the `output/` directory, and create a `merged.pdf` containing all generated PDFs.

## CSV Format

- The CSV must be semicolon-delimited (`;`).
- It must have a header row with three columns:
* a `number` column;
* a `name` column;
* a `pages` column;
- Example:

  ```
  number;name;pages
  01 - John Doe;1,3,4
  02 - Jane Smith;18,26,34
  ```

## How it Works

- The script reads the CSV and generates a PDF for each row using the template.
- Output filenames are constructed from the `name` field.
- If multiple PDFs are generated, they are merged into `merged.pdf` in the output directory.

## Dependencies

- [pdf-lib](https://www.npmjs.com/package/pdf-lib)
- [fs-extra](https://www.npmjs.com/package/fs-extra)
- [csv-parse/sync](https://www.npmjs.com/package/csv-parse)

## License

ISC License
