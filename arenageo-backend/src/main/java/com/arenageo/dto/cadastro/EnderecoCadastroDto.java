package com.arenageo.dto.cadastro;

import java.math.BigDecimal;
import jakarta.validation.constraints.*;

public record EnderecoCadastroDto(
    @Pattern(regexp = "^[0-9]{5}-?[0-9]{3}$|^$", message = "CEP deve conter 8 dígitos.") String zipCode,
    @Pattern(regexp = "^[A-Za-z]{2}$|^$", message = "Estado deve conter a sigla de 2 letras.") String state,
    @NotBlank(message = "Cidade é obrigatória.") @Size(max = 120) String city,
    @Size(max = 120) String neighborhood,
    @Size(max = 160) String street,
    @Size(max = 20) String number,
    @Size(max = 120) String complement,
    @DecimalMin("-90.0") @DecimalMax("90.0") BigDecimal latitude,
    @DecimalMin("-180.0") @DecimalMax("180.0") BigDecimal longitude
) {}
