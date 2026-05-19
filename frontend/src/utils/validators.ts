function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function normalizeCpf(value: string) {
  return value.replace(/\D/g, "");
}

function formatCpf(value: string) {
  const cpf = normalizeCpf(value).slice(0, 11);

  return cpf
    .replace(/^(\d{3})(\d)/, "$1.$2")
    .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1-$2");
}

function isValidCpf(value: string) {
  const cpf = normalizeCpf(value);

  if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) {
    return false;
  }

  let sum = 0;
  for (let index = 0; index < 9; index += 1) {
    sum += Number(cpf[index]) * (10 - index);
  }

  let remainder = (sum * 10) % 11;
  remainder = remainder === 10 ? 0 : remainder;
  if (remainder !== Number(cpf[9])) {
    return false;
  }

  sum = 0;
  for (let index = 0; index < 10; index += 1) {
    sum += Number(cpf[index]) * (11 - index);
  }

  remainder = (sum * 10) % 11;
  remainder = remainder === 10 ? 0 : remainder;

  return remainder === Number(cpf[10]);
}

function isValidPassword(password: string) {
  return password.trim().length >= 6;
}

export { formatCpf, isValidCpf, isValidEmail, isValidPassword, normalizeCpf };
