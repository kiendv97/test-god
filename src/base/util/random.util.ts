/* eslint-disable no-param-reassign */

export function random(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

const randomChar = () => String.fromCharCode(random(33, 126));

export const randomString = (stringLength: number) => {
  let randomString = '';
  while (stringLength--) randomString += randomChar();
  return randomString;
};

const rd = () => {
  let rd = random(65, 122);
  if (90 < rd && rd < 97)
    rd += 10;
  return rd;
};

export const randomAlphabet = (stringLength: number) => {
  let randomString = '';
  while (stringLength--) randomString += String.fromCharCode(rd());
  return randomString;
};


const customAlphabet = (alphabet: string, size: number) => {
  let randomString = '';
  while (size--) randomString += alphabet[random(0, alphabet.length - 1)];
  return randomString;
};

export const generateCode = (size: number = 10, format: number = 0) => {
  const objType = {
    0: '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ',
    1: '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    2: '0123456789abcdefghijklmnopqrstuvwxyz',
    3: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    4: 'abcdefghijklmnopqrstuvwxyz',
    5: '0123456789',
  };
  format = Number(format);
  format = isNaN(format) || format < 0 || format > 5 ? 0 : format;
  return customAlphabet(objType[format], size);
};

export const randomColor = (): string => '#' + Math.floor(Math.random() * 16777215).toString(16).padEnd(6, '0');
