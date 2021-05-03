const moment = require('moment');

module.exports = {
  
  // day, month, year -> YYYY-MM-DD
  dmyToString: function (day, month, year) {
    let dayStr = day.toString();
    dayStr = formatDayMonthYear(dayStr, -2);
    let monthStr = month.toString();
    monthStr = formatDayMonthYear(monthStr, -2);
    return year + '-' + monthStr + '-' + dayStr;
  },
  
  // dateStr is of the form 'YYYY-MM-DD'
  isSunday(dateStr) {
    let isoWeekday = moment(dateStr).isoWeekday();
    return isoWeekday === 7; // http://momentjs.com/docs/#/get-set/iso-weekday/
  },
  
  /*
    holidays is a date array: 'YYYY-MM-DD' retrieved in the table config with ID = 'holidays'
    date: 'YYYY-MM-DD'
  */
  isHolidays(holidays, date) {
    let index = holidays.indexOf(date);
    return index > -1;
  },
  
  getMinutesFromTime: function (time) {
    let splitTime = time.split(':');
    let hour = parseInt(splitTime[0]);
    let minute = parseInt(splitTime[1]);
    return hour * 60 + minute;
  },
  
  getCountBetween: function (startDateStr, endDateStr) {
    let oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
    let startDate = new Date(startDateStr);
    let endDate = new Date(endDateStr);
    return Math.round(Math.abs((startDate.getTime() - endDate.getTime()) / (oneDay)));
  },
  
  getToday(formatStr) {
    if (formatStr) {
      return moment().format(formatStr);
    } else {
      return moment();
    }
    // return moment().format('YYYY-MM-DD HH:mm:ss');
  },
  
  getFirstDayOfThisMonth(formatStr) {
    let m = moment().startOf('month');
    if (formatStr) {
      return m.format(formatStr);
    } else {
      return m;
    }
    // return moment().startOf('month').format('YYYY-MM-DD HH:mm:ss');
  },
  
  getFirstDayOfLastMonth(formatStr) {
    let m = moment().subtract(1, 'months').startOf('month');
    if (formatStr) {
      return m.format(formatStr);
    } else {
      return m;
    }
    // return moment().subtract(1,'months').startOf('month').format('YYYY-MM-DD HH:mm:ss');
  },
  
  getLastDayOfLastMonth(formatStr) {
    let m = moment().subtract(1, 'months').endOf('month');
    if (formatStr) {
      return m.format(formatStr);
    } else {
      return m;
    }
    // return moment().subtract(1,'months').endOf('month').format('YYYY-MM-DD HH:mm:ss');
  },
  
  // Return array of all days of the month (form YYYY-MM-DD)
  // month: 1 ~ 12
  getAllDateOfMonth(year, month) {
    let format = 'YYYY-MM-DD';
    let m = month - 1;  // zero-based
    let arr = [];
    let mm = moment().year(year).month(m).date(1);
    do {
      arr.push(mm.format(format));
      mm.add(1, 'days');
    } while (mm.month() == m)
    return arr;
  },
  
  // Calculate the number of seconds from sTime1 to sTime2
  // sTime1, sTime2 is a string
  timeBetween(sTime1, sTime2, format = 'YYYY-MM-DD HH:mm:ss') {
    if (!sTime1 || !sTime2) {
      return null;
    }
    let t1 = moment(sTime1, format);
    let t2 = moment(sTime2, format);
    if (!t1.isValid() || !t2.isValid()) {
      return null;
    }
    return t2.diff(t1, 'seconds');
  },
  
  // sTime must be a string of the form HH: mm: ss (each part must have 2 digits, have a 2-digit dot and must be between 00:00:00 ~ 23:59:59)
  validateTime_HHmmss(sTime) {
    if (!sTime || typeof sTime !== 'string') return false;
    return /^([0-1][0-9]|[0-2][0-3]):([0-5][0-9]):([0-5][0-9])$/g.test(sTime);
  },
  
  displayDuration(milliseconds) {
    let seconds = Math.round(milliseconds / 1000);
    let hours = Math.round(seconds / 3600);
    seconds = seconds % 3600;
    let minutes = Math.round(seconds / 60);
    seconds = seconds % 60;
    let msg = '';
    if (hours > 0) {
      msg += hours + 'giờ';
    }
    if (minutes > 0) {
      if (msg.length > 0) msg += ' ';
      msg += minutes + ' phút';
    }
    if (seconds > 0) {
      if (msg.length > 0) msg += ' ';
      msg += seconds + ' giây';
    } else {
      if (msg.length == 0) msg = '0 giây';
    }
    return msg;
  },
  
  buildTimeString(h, m, s, separator = ':') {
    let hh = h > 9 ? '' + h : '0' + h;
    let mm = m > 9 ? '' + m : '0' + m;
    let ss = s > 9 ? '' + s : '0' + s;
    return hh + separator + mm + separator + ss;
  },
  
  // Change from M / D / Y to YYYY-MM-DD
  // Used in function import excel worksheet
  date_M_D_Y_To_YYYY_MM_DD(value) {
    value = value.split('/');
    if (value[2].length == 2) value[2] = '20' + value[2];
    if (value[1].length == 1) value[1] = '0' + value[1];
    if (value[0].length == 1) value[0] = '0' + value[0];
    let y = value[2];
    let m = value[0];
    let d = value[1];
    value = y + '-' + m + '-' + d;
    return value;
  },

  addDays(dateObj, numDays) {
    let newDateObj = new Date(dateObj);
    newDateObj.setDate(newDateObj.getDate() + numDays);
    return newDateObj;
  }
};

function formatDayMonthYear(input, length) {
  input = '0000' + input;
  return input.slice(length);
}
