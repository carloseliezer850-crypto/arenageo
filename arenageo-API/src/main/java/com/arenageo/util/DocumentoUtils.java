package com.arenageo.util;

public final class DocumentoUtils {
    private DocumentoUtils() {}

    public static String somenteDigitos(String valor) {
        return valor == null ? "" : valor.replaceAll("[^0-9]", "");
    }

    public static boolean cpfValido(String documento) {
        String cpf = somenteDigitos(documento);
        if (cpf.length() != 11 || todosOsDigitosIguais(cpf)) return false;

        int soma = 0;
        for (int i = 0; i < 9; i++) soma += (cpf.charAt(i) - '0') * (10 - i);
        int primeiro = calcularDigito(soma);
        if (primeiro != cpf.charAt(9) - '0') return false;

        soma = 0;
        for (int i = 0; i < 10; i++) soma += (cpf.charAt(i) - '0') * (11 - i);
        return calcularDigito(soma) == cpf.charAt(10) - '0';
    }

    public static boolean cnpjValido(String documento) {
        String cnpj = somenteDigitos(documento);
        if (cnpj.length() != 14 || todosOsDigitosIguais(cnpj)) return false;

        int[] pesos1 = {5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2};
        int[] pesos2 = {6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2};
        int soma = 0;
        for (int i = 0; i < 12; i++) soma += (cnpj.charAt(i) - '0') * pesos1[i];
        if (calcularDigito(soma) != cnpj.charAt(12) - '0') return false;

        soma = 0;
        for (int i = 0; i < 13; i++) soma += (cnpj.charAt(i) - '0') * pesos2[i];
        return calcularDigito(soma) == cnpj.charAt(13) - '0';
    }

    private static int calcularDigito(int soma) {
        int resto = soma % 11;
        return resto < 2 ? 0 : 11 - resto;
    }

    private static boolean todosOsDigitosIguais(String documento) {
        return documento.chars().distinct().count() == 1;
    }
}
