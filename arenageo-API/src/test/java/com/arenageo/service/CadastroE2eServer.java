package com.arenageo.service;

/** Local-only E2E fixture. Always creates an empty disposable PostgreSQL database. */
public class CadastroE2eServer {
  public static void main(String[] args) {
    var pg = CadastroIntegracaoTest.pg;
    org.springframework.boot.SpringApplication.run(
        com.arenageo.ArenaGeoApplication.class,
        "--spring.config.import=",
        "--spring.datasource.url=" + pg.getJdbcUrl("postgres", "postgres"),
        "--spring.datasource.username=postgres",
        "--spring.datasource.password=",
        "--server.port=8088",
        "--security.jwt.secret-base64=YWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWE=",
        "--logging.level.org.springframework.boot.security.autoconfigure=ERROR");
  }
}
