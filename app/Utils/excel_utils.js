const mkdirp = require('mkdirp');
const XLSX = require('xlsx-style');
const moment = require('moment');
const config = {}; // config the path to save the export file and download link
const Utils = require('./utils');

const EXCEL_FORMAT_TEXT = "@";
const EXCEL_FORMAT_NUMBER = "#,##0";
const EXCEL_FORMAT_DATE = "yyyy/mm/dd";
const EXCEL_MAX_ROWS = 10000;
const EXCEL_MAX_COLS = 50;

module.exports = {
  
  /**
   * This function will generate an excel file in the upload / files / tmp folder and return the relative path
   * Note: the files in the upload / files / tmp folder are only temporary for frontend download, and later will be deleted
   * @param fileName x output file name.
   * @param headers array contains information for columns {key: 'userCode', value: 'Code NV', width: 15}
   * key: to get data in the listData array
   * value: text displayed
   * width: width of the column
   * @param listData export data
   * @param options
   */
  exportExcel(fileName, headers, listData, options) {
    let today = moment().format('YYYY-MM-DD');
    let relativePath = config.BackendUploadFolder + '/files/tmp/' + today + '/';   // tạo folder theo ngày
    let fullPath = config.BackendUploadBasedir + relativePath;
    try {
      mkdirp.sync(fullPath);
    } catch (err) {
      return err;
    }
    
    relativePath += fileName;
    fullPath += fileName;
    
    let should_format_number = function (key) {
      for (let h of headers) {
        if (h.key == key) return h.formatNumber;
      }
      return undefined;
    };
    
    let ws = {};
    var range = {s: {c: EXCEL_MAX_COLS, r: EXCEL_MAX_ROWS}, e: {c: 0, r: 0}};
    var wscols = [];
    // Style issue, if you use the correct SheetJS official library https://github.com/SheetJS/js-xlsx (npm xlsx), you must use the Pro version for a fee to support style.
    // If you still want to use it for free, there is another fork here https://github.com/protobi/js-xlsx (npm xlsx-style)
    let styleHeader = {
      fill: {
        patternType: 'solid',
        fgColor: {rgb: "C4D79B"}
      },
      font: {
        sz: 12,
        bold: true,
        color: {rgb: "000000"},
        name: 'Arial'
      },
      alignment: {
        horizontal: "center",
        vertical: "center",
        wrapText: true
      },
      numFmt: EXCEL_FORMAT_TEXT,
      border: {
        top: {style: 'thin', color: {rgb: "000000"}},
        bottom: {style: 'thin', color: {rgb: "000000"}},
        left: {style: 'thin', color: {rgb: "000000"}},
        right: {style: 'thin', color: {rgb: "000000"}}
      }
    };
    let C = 0, R = 0;
    let DEFAULT_COLUMN_WIDTH = 20;
    for (let i = 0; i < headers.length; i++) {
      if (range.s.r > R) range.s.r = R;
      if (range.s.c > C) range.s.c = C;
      if (range.e.r < R) range.e.r = R;
      if (range.e.c < C) range.e.c = C;
      let cell = {v: headers[i]['value'], t: 's', s: styleHeader, z: EXCEL_FORMAT_TEXT};
      if (headers[i]['fillColor']) {
        cell.s = Utils.cloneObject(styleHeader);
        cell.s.fill.fgColor.rgb = headers[i]['fillColor'];
      }
      let width = headers[i]['width'] || DEFAULT_COLUMN_WIDTH;
      wscols.push({wch: width});
      let cell_ref = XLSX.utils.encode_cell({c: C, r: R});
      ws[cell_ref] = cell;
      C++;
    }
    let styleCell = Utils.cloneObject(styleHeader);
    styleCell.font.bold = false;
    styleCell.font.sz = 12;
    styleCell.fill.patternType = 'none';
    let keys = headers.map(it => it.key);
    for (let i = 0; i < listData.length; i++) {
      C = 0;
      R++;
      for (let key of keys) {
        if (range.s.r > R) range.s.r = R;
        if (range.s.c > C) range.s.c = C;
        if (range.e.r < R) range.e.r = R;
        if (range.e.c < C) range.e.c = C;
        let cellValue = listData[i][key];
        if (cellValue === null || cellValue === undefined) {
          cellValue = '';
        }
        let cell = {v: cellValue, t: 's', s: styleCell, z: EXCEL_FORMAT_TEXT};
        let formatNumber = should_format_number(key);
        if (formatNumber) {
          cell.t = 'n';
          cell.z = cell.s.numFmt = formatNumber;
        } else if (options && options.formatDates && options.formatDates[key]) {
          if (cell.v.length > 0) {
            cell.t = 'd';
          }
          cell.z = cell.s.numFmt = options.formatDates[key];
        }
        let cell_ref = XLSX.utils.encode_cell({c: C, r: R});
        ws[cell_ref] = cell;
        C++;
      }
    }
    ws['!cols'] = wscols;
    if (range.s.c < EXCEL_MAX_COLS) ws['!ref'] = XLSX.utils.encode_range(range);
    
    let wb = {SheetNames: ['Sheet1'], Sheets: {}};
    wb.Sheets[wb.SheetNames[0]] = ws;
    
    XLSX.writeFile(wb, fullPath, {bookType: 'xlsx', bookSST: false, type: 'binary'});
    return relativePath;
  }
  
}; // module.exports


function should_format_date(key) {
  return false; // FIELDS_NEED_FORMAT_DATE[key] !== undefined;
}

function should_format_number(key) {
  return false; // FIELDS_NEED_FORMAT_NUMBER[key] !== undefined;
}

function should_format_string_length(key) {
  return false; // FIELDS_NEED_FORMAT_STR_LEN[key] !== undefined;
}
