export const sliceString = (str: string, maxLength: number) => {
  if (str.length <= maxLength) return str;

  return `${str.slice(0, maxLength)}...`;
};

export const sliceJoinArray = (array: any[], maxLength: number) => {
  let string = array[0] || "";
  for (let item of array) {
    const newStr = string.concat(`, ${item}`);
    if (newStr.length > maxLength) return string;
    string = newStr;
  }

  return string;
};
