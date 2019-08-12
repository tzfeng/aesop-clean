export function decimalToHex(number)
{
  if (number < 0) {
    number = 0xFFFFFFFF + number + 1;
  }
  return number.toString(16).toUpperCase();
}

export function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}


// decimalToHex(req[0])