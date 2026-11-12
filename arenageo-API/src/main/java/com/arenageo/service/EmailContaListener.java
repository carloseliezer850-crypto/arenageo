package com.arenageo.service;

import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionalEventListener;

@Component
public class EmailContaListener {
  private final ObjectProvider<JavaMailSender> mail;
  private final String base, from;
  private final boolean enabled;

  public EmailContaListener(
      ObjectProvider<JavaMailSender> mail,
      @Value("${app.public-url:http://localhost:3000}") String base,
      @Value("${app.mail-from:no-reply@example.test}") String from,
      @Value("${app.email-enabled:false}") boolean enabled) {
    this.enabled = enabled;
    this.mail = mail;
    this.base = base;
    this.from = from;
  }

  @TransactionalEventListener
  public void enviar(ContaService.EmailEvento event) {
    if (!enabled) return;
    var sender = mail.getIfAvailable();
    if (sender == null) return;
    try {
      var message = new SimpleMailMessage();
      message.setFrom(from);
      message.setTo(event.email());
      message.setSubject(
          "RESET".equals(event.tipo()) ? "Redefinir senha ArenaGeo" : "Confirmar e-mail ArenaGeo");
      message.setText(
          "Abra o link em até 30 minutos: "
              + base
              + "/conta?tipo="
              + event.tipo()
              + "#token="
              + event.token());
      sender.send(message);
    } catch (RuntimeException ex) {
      org.slf4j.LoggerFactory.getLogger(getClass())
          .warn("Envio de e-mail pendente; reenvio disponível. Tipo={}", event.tipo());
    }
  }
}
