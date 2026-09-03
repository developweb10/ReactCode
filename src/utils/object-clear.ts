export const removeFalsyValues = (obj: any) => {
  let newObj: any = {};
  Object.keys(obj).forEach((prop) => {
    if (obj[prop]) {
      newObj[prop] = obj[prop];
    }
  });
  return newObj;
};

export const removeEmptyStringValues = (obj: any) => {
  let newObj: any = {};
  Object.keys(obj).forEach((prop) => {
    if (obj[prop] !== "") {
      newObj[prop] = obj[prop];
    }
  });
  return newObj;
};

export const removeEmptyStringNullValues = (obj: any) => {
  let newObj: any = {};
  Object.keys(obj).forEach((prop) => {
    if (obj[prop] !== "" && obj[prop] !== null) {
      newObj[prop] = obj[prop];
    }
  });
  return newObj;
};
