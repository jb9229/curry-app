export function currencyformat(number) {
  if (number == 0) return 0;

  const reg = /(^[+-]?\d+)(\d{3})/;
  let n = `${number}`;

  while (reg.test(n)) n = n.replace(reg, '$1' + ',' + '$2');

  return n;
}
