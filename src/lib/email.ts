import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

export async function sendSlaEmail(params: {
  to: string;
  protocolo: string;
  pacienteNome: string;
  clinica: string;
  etapa: string;
  prazoEm: Date;
}) {
  const from = process.env.RESEND_FROM_EMAIL || "GRC <onboarding@resend.dev>";
  const subject = `[GRC] Protocolo ${params.protocolo} atrasado — ${params.etapa}`;
  const html = `
    <p>Olá,</p>
    <p>O protocolo <strong>${params.protocolo}</strong> ultrapassou o prazo da etapa <strong>${params.etapa}</strong>.</p>
    <ul>
      <li>Paciente: ${params.pacienteNome}</li>
      <li>Clínica: ${params.clinica}</li>
      <li>Prazo: ${params.prazoEm.toLocaleString("pt-BR")}</li>
    </ul>
    <p>Acesse o SISTEMA GRC para tomar providências.</p>
  `;

  if (!resend) {
    console.log("[email:dev]", { to: params.to, subject });
    return { ok: true, mocked: true };
  }

  const result = await resend.emails.send({
    from,
    to: params.to,
    subject,
    html,
  });

  return { ok: !result.error, error: result.error?.message };
}
