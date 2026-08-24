import { Resend } from "resend";

function getResend() {
  const key = process.env.RESEND_API_KEY?.trim();
  if (!key) return null;
  return new Resend(key);
}

export async function sendSlaEmail(params: {
  to: string;
  protocolo: string;
  pacienteNome: string;
  clinica: string;
  etapa: string;
  prazoEm: Date;
}) {
  const resend = getResend();
  const from =
    process.env.RESEND_FROM_EMAIL?.trim() ||
    "GRC Grupo Sorria <onboarding@resend.dev>";
  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL?.trim() ||
    process.env.BETTER_AUTH_URL?.trim() ||
    "https://sistema-grc-gamma.vercel.app";
  const subject = `[GRC] Protocolo ${params.protocolo} atrasado — ${params.etapa}`;
  const html = `
    <div style="font-family: Arial, sans-serif; color: #111; line-height: 1.5;">
      <p>Olá,</p>
      <p>O protocolo <strong>${params.protocolo}</strong> ultrapassou o prazo da etapa <strong>${params.etapa}</strong>.</p>
      <ul>
        <li><strong>Paciente:</strong> ${params.pacienteNome}</li>
        <li><strong>Clínica:</strong> ${params.clinica}</li>
        <li><strong>Prazo:</strong> ${params.prazoEm.toLocaleString("pt-BR")}</li>
      </ul>
      <p>
        <a href="${appUrl}/reclamacoes" style="display:inline-block;background:#ffce00;color:#111;padding:10px 16px;border-radius:6px;text-decoration:none;font-weight:600;">
          Abrir SISTEMA GRC
        </a>
      </p>
      <p style="color:#5c5748;font-size:12px;">Este e-mail foi enviado automaticamente pelo SISTEMA GRC.</p>
    </div>
  `;

  if (!resend) {
    console.log("[email:dev]", { to: params.to, subject });
    return { ok: true as const, mocked: true };
  }

  const result = await resend.emails.send({
    from,
    to: params.to,
    subject,
    html,
  });

  if (result.error) {
    console.error("[email:erro]", result.error);
    return { ok: false as const, error: result.error.message };
  }

  return { ok: true as const, id: result.data?.id };
}
