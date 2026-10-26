package com.arenageo.util;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import org.junit.jupiter.api.Test;

class DocumentoUtilsTest {
    @Test
    void deveValidarCpfComMascara() {
        assertTrue(DocumentoUtils.cpfValido("529.982.247-25"));
    }
    @Test
    void deveRejeitarCpfComDigitosInvalidos() {
        assertFalse(DocumentoUtils.cpfValido("111.111.111-11"));
        assertFalse(DocumentoUtils.cpfValido("529.982.247-24"));
    }
    @Test
    void deveValidarCnpjComMascara() {
        assertTrue(DocumentoUtils.cnpjValido("11.222.333/0001-81"));
    }
    @Test
    void deveRejeitarCnpjComDigitosInvalidos() {
        assertFalse(DocumentoUtils.cnpjValido("11.222.333/0001-80"));
        assertFalse(DocumentoUtils.cnpjValido("00.000.000/0000-00"));
    }
}
