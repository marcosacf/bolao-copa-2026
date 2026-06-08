// lib/sheets.js — conexão com Google Sheets via Service Account

import { google } from 'googleapis';

const SHEET_NAME = 'DADOS_BOLAO';
const SPREADSHEET_ID = process.env.SPREADSHEET_ID;

function getAuth() {
  const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);
  return new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
}

export async function getSheet() {
  const auth = getAuth();
  const sheets = google.sheets({ version: 'v4', auth });
  return { sheets, spreadsheetId: SPREADSHEET_ID, sheetName: SHEET_NAME };
}

export async function readRows() {
  const { sheets, spreadsheetId, sheetName } = await getSheet();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${sheetName}!A:H`,
  });
  return res.data.values || [];
}

export async function appendRow(values) {
  return appendRows([values]);
}

export async function appendRows(rows) {
  if (!rows.length) return;
  const { sheets, spreadsheetId, sheetName } = await getSheet();
  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: `${sheetName}!A:H`,
    valueInputOption: 'RAW',
    requestBody: { values: rows },
  });
}

export async function updateCell(row, col, value) {
  return updateCells([{ row, col, value }]);
}

export async function updateCells(updates) {
  if (!updates.length) return;
  const { sheets, spreadsheetId, sheetName } = await getSheet();
  const data = updates.map(({ row, col, value }) => ({
    range: `${sheetName}!${String.fromCharCode(64 + col)}${row}`,
    values: [[value]],
  }));
  await sheets.spreadsheets.values.batchUpdate({
    spreadsheetId,
    requestBody: { valueInputOption: 'RAW', data },
  });
}

export async function deleteRows(rowIndexes) {
  // rowIndexes: array de índices 0-based (da planilha)
  const { sheets, spreadsheetId } = await getSheet();

  // Busca o sheetId
  const meta = await sheets.spreadsheets.get({ spreadsheetId });
  const sheet = meta.data.sheets.find(s => s.properties.title === SHEET_NAME);
  const sheetId = sheet.properties.sheetId;

  // Ordena decrescente para não deslocar índices
  const sorted = [...rowIndexes].sort((a, b) => b - a);

  const requests = sorted.map(rowIndex => ({
    deleteDimension: {
      range: {
        sheetId,
        dimension: 'ROWS',
        startIndex: rowIndex,
        endIndex: rowIndex + 1,
      },
    },
  }));

  if (requests.length > 0) {
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: { requests },
    });
  }
}
