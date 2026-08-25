import { Resend } from "resend";

function getResend() {
  const key = process.env.RESEND_API_KEY?.trim();
  if (!key) return null;
  return new Resend(key);
}

function emailMeta() {
  const from =
    process.env.RESEND_FROM_EMAIL?.trim() ||
    "GRC Grupo Sorria <noreply@sorriagrc.com.br>";
  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL?.trim() ||
    process.env.BETTER_AUTH_URL?.trim() ||
    "https://www.sorriagrc.com.br";
  return { from, appUrl };
}

async function sendMail(params: {
  to: string;
  subject: string;
  html: string;
}) {
  const resend = getResend();
  const { from } = emailMeta();

  if (!resend) {
    console.log("[email:dev]", { to: params.to, subject: params.subject });
    return { ok: true as const, mocked: true };
  }

  const result = await resend.emails.send({
    from,
    to: params.to,
    subject: params.subject,
    html: params.html,
  });

  if (result.error) {
    console.error("[email:erro]", result.error);
    return { ok: false as const, error: result.error.message };
  }

  return { ok: true as const, id: result.data?.id };
}

function formatPrazo(prazoEm: Date) {
  return prazoEm.toLocaleString("pt-BR", {
    timeZone: "America/Sao_Paulo",
  });
}

function rodape() {
  return `<p style="color:#5c5748;font-size:12px;">Este e-mail foi enviado automaticamente pelo SISTEMA GRC.</p>`;
}

function botaoAbrir(appUrl: string, reclamacaoId?: string) {
  const href = reclamacaoId
    ? `${appUrl}/reclamacoes/${reclamacaoId}`
    : `${appUrl}/reclamacoes`;
  return `
    <p>
      <a href="${href}" style="display:inline-block;background:#ffce00;color:#111;padding:10px 16px;border-radius:6px;text-decoration:none;font-weight:600;">
        Abrir SISTEMA GRC
      </a>
    </p>
  `;
}

function blocoDescricao(descricao: string) {
  return `
    <p><strong>Descrição:</strong></p>
    <p style="white-space: pre-wrap; background: #fffdf6; border: 1px solid #e8e2d0; border-radius: 8px; padding: 12px;">${descricao}</p>
  `;
}

export async function sendSlaEmail(params: {
  to: string;
  protocolo: string;
  pacienteNome: string;
  clinica: string;
  etapa: string;
  prazoEm: Date;
  descricao: string;
  responsavelAtendimento: string;
}) {
  const { appUrl } = emailMeta();
  const subject = `[GRC] Protocolo ${params.protocolo} atrasado — ${params.etapa}`;
  const html = `
    <div style="font-family: Arial, sans-serif; color: #111; line-height: 1.5;">
      <p>Olá,</p>
      <p>O protocolo <strong>${params.protocolo}</strong> ultrapassou o prazo da etapa <strong>${params.etapa}</strong>.</p>
      <ul>
        <li><strong>Paciente:</strong> ${params.pacienteNome}</li>
        <li><strong>Clínica:</strong> ${params.clinica}</li>
        <li><strong>Responsável pelo atendimento:</strong> ${params.responsavelAtendimento}</li>
        <li><strong>Prazo:</strong> ${formatPrazo(params.prazoEm)}</li>
      </ul>
      ${blocoDescricao(params.descricao)}
      ${botaoAbrir(appUrl)}
      ${rodape()}
    </div>
  `;

  return sendMail({ to: params.to, subject, html });
}

export async function sendReclamacaoAbertaEmail(params: {
  to: string;
  reclamacaoId: string;
  protocolo: string;
  pacienteNome: string;
  clinica: string;
  etapa: string | null;
  prazoEm: Date | null;
  descricao: string;
  responsavelAtendimento: string;
}) {
  const { appUrl } = emailMeta();
  const subject = `[GRC] Protocolo ${params.protocolo} aberto`;
  const html = `
    <div style="font-family: Arial, sans-serif; color: #111; line-height: 1.5;">
      <p>Olá,</p>
      <p>Uma nova reclamação foi aberta e você é o responsável pelo atendimento.</p>
      <ul>
        <li><strong>Protocolo:</strong> ${params.protocolo}</li>
        <li><strong>Paciente:</strong> ${params.pacienteNome}</li>
        <li><strong>Clínica:</strong> ${params.clinica}</li>
        <li><strong>Responsável pelo atendimento:</strong> ${params.responsavelAtendimento}</li>
        <li><strong>Etapa:</strong> ${params.etapa || "—"}</li>
        <li><strong>Prazo:</strong> ${
          params.prazoEm ? formatPrazo(params.prazoEm) : "—"
        }</li>
      </ul>
      ${blocoDescricao(params.descricao)}
      ${botaoAbrir(appUrl, params.reclamacaoId)}
      ${rodape()}
    </div>
  `;

  return sendMail({ to: params.to, subject, html });
}

export async function sendReclamacaoEncerradaEmail(params: {
  to: string;
  reclamacaoId: string;
  protocolo: string;
  pacienteNome: string;
  clinica: string;
  descricao: string;
  parecerFinal: string;
  responsavelAtendimento: string;
}) {
  const { appUrl } = emailMeta();
  const subject = `[GRC] Protocolo ${params.protocolo} encerrado`;
  const html = `
    <div style="font-family: Arial, sans-serif; color: #111; line-height: 1.5;">
      <p>Olá,</p>
      <p>A reclamação <strong>${params.protocolo}</strong> foi encerrada.</p>
      <ul>
        <li><strong>Paciente:</strong> ${params.pacienteNome}</li>
        <li><strong>Clínica:</strong> ${params.clinica}</li>
        <li><strong>Responsável pelo atendimento:</strong> ${params.responsavelAtendimento}</li>
      </ul>
      ${blocoDescricao(params.descricao)}
      <p><strong>Parecer final:</strong></p>
      <p style="white-space: pre-wrap; background: #fffdf6; border: 1px solid #e8e2d0; border-radius: 8px; padding: 12px;">${params.parecerFinal}</p>
      ${botaoAbrir(appUrl, params.reclamacaoId)}
      ${rodape()}
    </div>
  `;

  return sendMail({ to: params.to, subject, html });
}
