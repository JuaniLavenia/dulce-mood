// DulceMood sheet helpers (Google Apps Script, bound to the catalog spreadsheet).
// - doGet: serves the "Productos" tab as CSV. Deployed as a web app, its URL is the
//   site's SHEET_URL. Unlike "Publish to web", it is never cached, so a rebuild
//   triggered right after editing always reads fresh data.
// - "DulceMood > Publicar cambios" menu: calls the hosting deploy hook.
// Setup steps are in the README ("Planilla y botón de publicar").

const SHEET_NAME = 'Productos';
const HEADERS = ['producto', 'categoria', 'variante', 'precio', 'disponibilidad', 'imagen', 'descripcion'];
const AVAILABILITY = ['Disponible', 'Por encargo', 'Agotado'];

function onOpen() {
  SpreadsheetApp.getUi().createMenu('DulceMood').addItem('Publicar cambios', 'publishChanges').addToUi();
}

function doGet() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  // getDisplayValues keeps what she sees ("1.500"), the site parses Argentine formats.
  const rows = sheet ? sheet.getDataRange().getDisplayValues() : [];
  return ContentService.createTextOutput(toCsv(rows)).setMimeType(ContentService.MimeType.CSV);
}

function toCsv(rows) {
  const escape = (value) => {
    const text = String(value);
    return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
  };
  return rows.map((row) => row.map(escape).join(',')).join('\n');
}

function publishChanges() {
  const ui = SpreadsheetApp.getUi();
  const hook = PropertiesService.getScriptProperties().getProperty('DEPLOY_HOOK_URL');
  if (!hook) {
    ui.alert('Falta configurar el botón de publicar (DEPLOY_HOOK_URL). Avisale a quien armó el sitio.');
    return;
  }
  const answer = ui.alert(
    'Publicar cambios',
    '¿Querés publicar el catálogo en el sitio? Los cambios se ven en unos minutos.',
    ui.ButtonSet.YES_NO,
  );
  if (answer !== ui.Button.YES) return;

  const response = UrlFetchApp.fetch(hook, { method: 'post', muteHttpExceptions: true });
  const code = response.getResponseCode();
  ui.alert(
    code < 300
      ? '¡Listo! El sitio se está actualizando. En 2 o 3 minutos vas a ver los cambios.'
      : `No se pudo publicar (error ${code}). Probá de nuevo en un rato o avisale a quien armó el sitio.`,
  );
}

// Run once from the Apps Script editor: creates the "Productos" tab with headers,
// a frozen header row and the availability dropdown.
function setupSheet() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = spreadsheet.getSheetByName(SHEET_NAME) || spreadsheet.insertSheet(SHEET_NAME);
  sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]).setFontWeight('bold');
  sheet.setFrozenRows(1);
  const availability = SpreadsheetApp.newDataValidation().requireValueInList(AVAILABILITY, true).build();
  sheet.getRange(2, HEADERS.indexOf('disponibilidad') + 1, sheet.getMaxRows() - 1).setDataValidation(availability);
}
