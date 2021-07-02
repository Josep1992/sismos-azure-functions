function omit(obj = {}, propsToOmit = []) {
  if (!Array.isArray(propsToOmit))
    throw new Error('"propsToOmit" must be type of array');

  let copy = { ...obj };

  for (let key of propsToOmit) {
    if (copy[key]) {
      delete copy[key];
    }
  }

  return copy;
}

// function mapper(obj, replacer) {
//   // extend this method to also modify object values
//   // replacer({key,value:copy[key]})
//   if (typeof replacer !== "function")
//     throw new Error('"replacer" type of replacer must be a function');

//   let copy = { ...obj }
//   for (let key in copy) {
//     if (replacer({ key }) !== key && typeof replacer({ key }) === "string") {
//       let isSameValue = value && Object.is(replacer({ value }), copy[key])
//       copy[replacer({ key })] = !isSameValue ? replacer({ value }) : copy[key]// replace key
//       delete copy[key]; //remove replaced key
//     }
//   }
//   return copy;
// }

function mapper(obj, replacer) {
  // extend this method to also modify object values
  // replacer({key,value:copy[key]})
  if (typeof replacer !== "function")
    throw new Error('"replacer" type of replacer must be a function');

  let copy = { ...obj }
  for (let key in copy) {
    if (replacer(key) !== key && typeof replacer(key) === "string") {
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