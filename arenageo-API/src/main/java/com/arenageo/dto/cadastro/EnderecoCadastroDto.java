package com.arenageo.dto.cadastro;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;

public record EnderecoCadastroDto(
    @Pattern(regexp = "^[0-9]{5}-?[0-9]{3}$|^$", message = "CEP deve conter 8 dígitos.")
        String zipCode,
    @NotBlank(message = "Selecione o estado.")
        @Pattern(
            regexp =
                "^(AC|AL|AP|AM|BA|CE|DF|ES|GO|MA|MT|MS|MG|PA|PB|PR|PE|PI|RJ|RN|RS|RO|RR|SC|SP|SE|TO)$",
            message = "Selecione uma UF brasileira válida.")
        String state,
    @NotBlank(message = "Cidade é obrigatória.") @Size(max = 120, message = "Limite máximo: 120.")
        String city,
    @Size(max = 120, message = "Limite máximo: 120.") String neighborhood,
    @Size(max = 160, message = "Limite máximo: 160.") String street,
    @Size(max = 20, message = "Limite máximo: 20.") String number,
    @Size(max = 120, message = "Limite máximo: 120.") String complement,
    @DecimalMin("-90.0") @DecimalMax("90.0") BigDecimal latitude,
    @DecimalMin("-180.0") @DecimalMax("180.0") BigDecimal longitude) {
  public EnderecoCadastroDto {
    city = city == null ? null : city.trim();
    state = state == null ? null : state.trim().toUpperCase(java.util.Locale.ROOT);
  }

  @AssertTrue(message = "Latitude e longitude devem ser informadas juntas.")
  public boolean isCoordenadasInformadasEmPar() {
    return (latitude == null && longitude == null) || (latitude != null && longitude != null);
  }
}
