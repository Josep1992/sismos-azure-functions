function omit(obj = {}, propsToOmit = []) {
  if (!Array.isArray(propsToOmit))
    throw new Error('"propsToOmit" must be type of array');

  let copy = { ...obj };

  for (let key of propsToOmit) {
    delete copy[key];
  }

  return copy;
}

function mapper(obj, replacer) {
  if (typeof replacer !== "function")
    throw new Error('"replacer" type of replacer must be a function');

  let copy = { ...obj }
  for (let key in copy) {
    if (replacer(key) !== key) {
      copy[replacer(key)] = copy[key] // replace key
      delete copy[key]; //remove replaced key
    }
  }
  return copy;
}

function shape(obj, expectedProperties) {
  let result = { isValid: false }
  if (!Array.isArray(expectedProperties))
    throw new Error('"expectedProperties" must be type of array');

  if (expectedProperties.every((prop) => (prop in obj))) {
    result.isValid = true;
  }

  return result
}

module.exports = { omit, mapper, shape }