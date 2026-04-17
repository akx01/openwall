const Filter = require("bad-words");
const filter = new Filter();

// Returns cleaned string with bad words replaced by ***
exports.clean = (text) => {
  try {
    return filter.clean(text);
  } catch {
    return text; // bad-words throws on empty strings
  }
};

// Returns true if text contains profanity
exports.isProfane = (text) => {
  try {
    return filter.isProfane(text);
  } catch {
    return false;
  }
};