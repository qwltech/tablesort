/*** Copyright 2013 Teun Duynstee Licensed under the Apache License, Version 2.0 ***/
!function(n,t){"function"==typeof define&&define.amd?define([],t):"object"==typeof exports?module.exports=t():n.firstBy=t()}(this,function(){var n=function(){function n(n){return n}function t(n){return"string"==typeof n?n.toLowerCase():n}function r(r,e){if(e="number"==typeof e?{direction:e}:e||{},"function"!=typeof r){var i=r;r=function(n){return n[i]?n[i]:""}}if(1===r.length){var o=r,f=e.ignoreCase?t:n,u=e.cmp||function(n,t){return n<t?-1:n>t?1:0};r=function(n,t){return u(f(o(n)),f(o(t)))}}return e.direction===-1?function(n,t){return-r(n,t)}:r}function e(n,t){var i="function"==typeof this&&!this.firstBy&&this,o=r(n,t),f=i?function(n,t){return i(n,t)||o(n,t)}:o;return f.thenBy=e,f}return e.firstBy=e,e}();return n});

// StackExchange
String.prototype.hashCode = function() {
  var hash = 0, i, chr;
  if (this.length === 0) return hash;
  for (i = 0; i < this.length; i++) {
    chr   = this.charCodeAt(i);
    hash  = ((hash << 5) - hash) + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
};

// My script below

const hashes = {
  headerText: -500128193,
  nonTabularLines: [0, 487653022, 880680032]
};

var data = [];
var headerText = "";

(function mapInterfaceToFunctions() {
  $("#run").on('click', run);
})();

function run() {
  parse();
  sort();
  renderOutput();
}

function parse() {
  data = [];
  var text = $("#input").val().split('\n');

  for (const i in text) {
    if (isValidHeaderText(text[i]))
      headerText = text[i];

    if (lineIsValid(text[i]) == false) continue;

    data.push(sanitizeInput(text[i].split('\t')));
  }
}

function isValidHeaderText(str) {
  return typeof str == "string" && str.hashCode() == hashes.headerText;
}

function sanitizeInput(strArray) {
  strArray[3] = strArray[3]; // removeSeconds(strArray[3]);
  strArray[5] = abbreviate(strArray[5]);
  strArray[6] = abbreviate(strArray[6]);
  strArray[7] = strArray[7]; // removeSeconds(strArray[7]);
  strArray[8] = capitalize(strArray[8]);
  strArray[9] = capitalize(strArray[9]);
  strArray[11] = capitalize(strArray[11]);
  strArray[12] = capitalize(strArray[12]);
  return strArray;

  function removeSeconds(str) {
    return str.replace(RegExp(':[0-9][0-9] '), ' ');
  }

  function capitalize(str) {
    var s = "";
    var w = new WordState();
    for (var i = 0; i < str.length; i++) {
      w.update(str[i]);
      if (w.beginning) s += str[i].toUpperCase();
      else s += str[i].toLowerCase();
    }
    return s;
  }

  function abbreviate(str) {
    var s = "";

    for (var i = 0; i < str.length; i++) {
      if (isLowerCase(str[i]) && str[i] == str[i - 1])
        continue;

      if (isCapital(str[i]) || isConsonant(str[i]))
        s += str[i];
    }

    if (s.length == 0)
      s = str;
    return s;
  }

  function WordState() {
    // Initial state
    this.beginning = false;
    this.previousChar = ' ';
    this.update = function(c) {
      if (isWhiteSpace(this.previousChar) && !isWhiteSpace(c))
        this.beginning = true;
      else
        this.beginning = false;

      this.previousChar = c;
    };
  }

  function isCapital(c) { return RegExp('[A-Z]').test(c) }
  function isConsonant(c) { return RegExp('[BCDFGHJKLMNPQRSTVWXYZ]').test(c.toUpperCase()); }
  function isLowerCase(c) { return RegExp('[a-z]').test(c) }
  function isWhiteSpace(c) { return RegExp('[ \t\r\n]').test(c) }
}

function datekey(d) {
  var date = parsedate(d);
  return date.year * 100000000
    + date.month * 1000000
    + date.day * 10000
    + date.hour24 * 100
    + date.minute;
}

function parsedate(str) {
  var a = str.split(' ');
  var datepart = a[0].split('/');
  var timepart = a[1].split(':');

  var date = {
    year: Number(datepart[2]),
    month: Number(datepart[0]),
    day: Number(datepart[1]),
    hour12: Number(timepart[0]),
    minute: Number(timepart[1]),
    second: Number(timepart[2]),
    ampm: a[2]
  };

  if (date.ampm == 'PM' && date.hour12 <= 11)
    date.hour24 = date.hour12 + 12;
  else if (date.ampm == 'AM' && date.hour12 == 12)
    date.hour24 = 0;
  else
    date.hour24 = date.hour12;

  return date;
}

function sort() {
  // data.sort(firstBy(7));
  data.sort(firstBy(0).thenBy(1).thenBy(function (v) {
    return datekey(v[7]);
  }));
}

function renderOutput() {
  var thead = mktag("thead");
  var tbody = mktag("tbody");
  var table = mktag("table");

  thead.append(renderHeader());
  table.append(thead);

  for (var i = 0; i < data.length; i++)
    tbody.append(renderRow(data[i]));
  table.append(tbody);

  $("#output").empty().append(table);

  function renderHeader() {
    var tr = mktag("tr");
    var items = headerText.split('\t');
    for (const i in items)
      tr.append("<th>" + items[i] + "</th>");
    return tr;
  }

  function renderRow(data) {
    var tr = mktag("tr");
    for (const i in data)
      tr.append("<td>" + data[i] + "</td>");
    return tr;
  }
}

function mktag(str) { return $("<" + str + "></" + str + ">"); }

function lineIsValid(str) {
  // Match string against known hashes of invalid lines
  var h = str.hashCode();

  if (h == hashes.headerText) return false;

  for (var i = 0; i < hashes.nonTabularLines.length; i++)
    if (h == hashes.nonTabularLines[i])
      return false;

  return true;
}
