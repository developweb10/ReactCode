export const onlyLetters = /^[a-zA-Z-]+$/;

export const onlyLettersAndSpaces = /^[a-zA-Z\s]*$/;

export const onlyLettersAndSpacesWithHyphen = /^[a-zA-Z-\s]*$/;

export const onlyNumbers = /^\d+$/;

export const phoneFormat = /^[+]?[\s./0-9]*[(]?[0-9]{1,4}[)]?[-\s./0-9]*$/g;

export const startWhitespace = /^\s+/g;

export const phoneRegExp = /^((\+[1-9]{1,4}[ -]?)|(\([0-9]{2,3}\)[ -]?)|([0-9]{2,4})[ -]?)*?[0-9]{3,4}[ -]?[0-9]{3,4}$/;
