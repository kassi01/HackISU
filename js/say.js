/* globals SpeechSynthesisUtterance: true */

/**
 * Uses HTML5 speech api to output speech instructions.
 * @function say
 * @param {String} instruction Text to output via speech
 */
function say(instruction) {
  'use strict';
  if (window.speechSynthesis !== undefined) {
    var speechObject = new SpeechSynthesisUtterance();
    // for iOS
    var samanthaE = {
      name: 'Samantha (Enhanced)',
      voiceURI: 'com.apple.ttsbundle.Samantha-premium',
      lang: 'en-US',
      localService: true,
      'default': true
    };
    var pitch = 1.1;
    var rate = 1.0;
    var volume = 1.0;
    var cleanText;
    var expandedText;
    speechObject.volume = volume;
    speechObject.rate = rate;
    speechObject.pitch = pitch;
    speechObject.lang = 'en-US';
    speechObject.voice = samanthaE;
    cleanText = stripBoldTags(instruction);
    expandedText = expandAbbrev(cleanText);
    speechObject.text = expandedText;
    window.speechSynthesis.speak(speechObject);
  }
}

/**
 * Recursively strips opening and/or closing html <b> and </b> tags from a string.
 * @function stripBoldTags
 * @param {String} inStr string possibly containing bold tags
 * @returns {string} inStr the input string with bold tags removed
 */
function stripBoldTags(inStr) {
  'use strict';
  var isFound = inStr.search('<b>');
  if (isFound !== -1) {
    var newStr1 = inStr.replace('<b>','');
    var newStr2 = newStr1.replace('</b>','');
    return stripBoldTags(newStr2);
  } else {
    return inStr;
  }
}

/**
 * Expands abbreviations given in directions to their full words.
 * @function expandAbbrev
 * @param {String} abbrev One complete directions step
 * @returns {String} expandedAbbrev The complete directions step with abbreviations expanded into words
 */
function expandAbbrev(abbrev) {
  'use strict';

  var inputString = abbrev.split('');
  var inputLength = inputString.length;
  var expandedAbbrev = '';

  var abbreviations =
  {
    'N': 'north',
    'S': 'south',
    'E': 'east',
    'W': 'west',
    'NW': 'northwest',
    'NE': 'northeast',
    'SE': 'southeast',
    'SW': 'southwest',
    'NB': 'northbound',
    'SB': 'southbound',
    'WB': 'westbound',
    'EB': 'eastbound',
    'Ave': 'Avenue',
    'Ln': 'Lane',
    'Hwy': 'Highway',
    'Ct': 'Court',
    'Tr': 'Trail'
  };

  // look for valid abbreviations three characters at a time
  var prevChar; // current char, position = i - 1
  var thisChar; // current char, position = i
  var nextChar; // current char, position - i + 1
  var prev;     // prev index
  var next;     // next index
  var abbrevString; // all three characters
  var testAbbrev; // results of checking to see if abbrevString is one of the abbreviations we expand
  for (var i = 0; i < inputLength; i++) {
    // grab the contents of the three-char window we're looking through (a length 3 substring)
    prev = i - 1;
    next = i + 1;
    prevChar = inputString[prev];
    thisChar = inputString[i];
    nextChar = inputString[next];
    // get rid of spaces and undefined values
    if (prevChar === ' ') {
      prevChar = '';
    }
    if (nextChar === ' ') {
      nextChar = '';
    }
    if (typeof prevChar === 'undefined') {
      prevChar = '';
    }
    if (typeof nextChar === 'undefined') {
      nextChar = '';
    }

    abbrevString = prevChar + thisChar + nextChar;

    testAbbrev = abbreviations[abbrevString];
    if (typeof testAbbrev !== 'undefined') {
      // if we get a result we can replace the abbreviation with the expanded word
      inputString[i] = ' ' + testAbbrev + ' ';
    }
  }
  // assemble the string to actually say
  for (var j = 0; j < i; j++) {
    expandedAbbrev = expandedAbbrev + inputString[j];
  }
  //console.log(expandedAbbrev);
  return expandedAbbrev;
}
