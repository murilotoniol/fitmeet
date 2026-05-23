import { describe, expect, it } from "vitest";

import { formatCpf, isValidCpf, isValidEmail, isValidPassword, normalizeCpf } from "./validators";

describe("validators", () => {
  it("valida e-mails com formato correto", () => {
    expect(isValidEmail("joao@email.com")).toBe(true);
    expect(isValidEmail("joao.email.com")).toBe(false);
    expect(isValidEmail("joao@")).toBe(false);
  });

  it("normaliza e formata CPF", () => {
    expect(normalizeCpf("390.688.040-06")).toBe("39068804006");
    expect(formatCpf("39068804006")).toBe("390.688.040-06");
  });

  it("valida CPF pelo digito verificador", () => {
    expect(isValidCpf("390.688.040-06")).toBe(true);
    expect(isValidCpf("111.111.111-11")).toBe(false);
    expect(isValidCpf("390.688.040-00")).toBe(false);
  });

  it("valida senha com no minimo seis caracteres nao vazios", () => {
    expect(isValidPassword("123123")).toBe(true);
    expect(isValidPassword("12345")).toBe(false);
    expect(isValidPassword("      ")).toBe(false);
  });
});
