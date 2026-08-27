export const roleLabels: Record<string, string> = {
  ADMIN: "Administrador",
  PADRAO: "Padrão",
};

export const cargoLabels: Record<string, string> = {
  SAC: "SAC",
  DENTISTA: "Dentista",
  SECRETARIA: "Secretária",
  COORDENADOR: "Coordenador",
  GERENCIA: "Gerência",
  DIRETORIA: "Diretoria",
};

export const canalLabels: Record<string, string> = {
  WHATSAPP: "WhatsApp",
  INSTAGRAM: "Instagram",
  GOOGLE: "Google",
  RECLAME_AQUI: "Reclame Aqui",
  TELEFONE: "Telefone",
  CRC: "CRC",
  EMAIL: "E-mail",
  OUTRO: "Outro",
};

export const prioridadeLabels: Record<string, string> = {
  BAIXA: "Baixa",
  MEDIA: "Média",
  ALTA: "Alta",
  URGENTE: "Urgente",
};

export const statusLabels: Record<string, string> = {
  ABERTA: "Aberta",
  EM_ANDAMENTO: "Em andamento",
  ATRASADA: "Atrasada",
  AGUARDANDO_PARECER: "Aguardando parecer",
  VINCULADA_TRATAMENTO: "Vinculada a um tratamento",
  CONCLUIDA: "Concluída",
  ENCERRADA: "Encerrada",
};

export const statusColors: Record<string, string> = {
  ABERTA: "bg-sky-100 text-sky-800",
  EM_ANDAMENTO: "bg-amber-100 text-amber-800",
  ATRASADA: "bg-red-100 text-red-800",
  AGUARDANDO_PARECER: "bg-violet-100 text-violet-800",
  VINCULADA_TRATAMENTO: "bg-teal-100 text-teal-800",
  CONCLUIDA: "bg-emerald-100 text-emerald-800",
  ENCERRADA: "bg-slate-100 text-slate-700",
};

export const statusTratamentoLabels: Record<string, string> = {
  EM_ANDAMENTO: "Em andamento",
  CONCLUIDO: "Concluído",
  CANCELADO: "Cancelado",
};

export const statusTratamentoColors: Record<string, string> = {
  EM_ANDAMENTO: "bg-amber-100 text-amber-800",
  CONCLUIDO: "bg-emerald-100 text-emerald-800",
  CANCELADO: "bg-slate-100 text-slate-700",
};
