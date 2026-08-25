-- Migração: tratamento com clínica, data próxima, histórico e 1:1 com reclamação

ALTER TABLE "tratamento" ADD COLUMN IF NOT EXISTS "clinicId" TEXT;
ALTER TABLE "tratamento" ADD COLUMN IF NOT EXISTS "dataProxima" TIMESTAMP(3);
ALTER TABLE "tratamento" ADD COLUMN IF NOT EXISTS "finalizadoEm" TIMESTAMP(3);

UPDATE "tratamento" t
SET "clinicId" = r."clinicId"
FROM "reclamacao" r
WHERE t."reclamacaoId" = r."id"
  AND (t."clinicId" IS NULL OR t."clinicId" = '');

DELETE FROM "tratamento" a
USING "tratamento" b
WHERE a."reclamacaoId" = b."reclamacaoId"
  AND a."createdAt" < b."createdAt";

ALTER TABLE "tratamento" ALTER COLUMN "clinicId" SET NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'tratamento_reclamacaoId_key'
  ) THEN
    ALTER TABLE "tratamento" ADD CONSTRAINT "tratamento_reclamacaoId_key" UNIQUE ("reclamacaoId");
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'tratamento_clinicId_fkey'
  ) THEN
    ALTER TABLE "tratamento"
      ADD CONSTRAINT "tratamento_clinicId_fkey"
      FOREIGN KEY ("clinicId") REFERENCES "clinic"("id")
      ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS "tratamento_status_idx" ON "tratamento"("status");
CREATE INDEX IF NOT EXISTS "tratamento_clinicId_idx" ON "tratamento"("clinicId");
CREATE INDEX IF NOT EXISTS "tratamento_dataProxima_idx" ON "tratamento"("dataProxima");

CREATE TABLE IF NOT EXISTS "historico_tratamento" (
  "id" TEXT NOT NULL,
  "tratamentoId" TEXT NOT NULL,
  "usuarioId" TEXT,
  "acao" TEXT NOT NULL,
  "detalhe" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "historico_tratamento_pkey" PRIMARY KEY ("id")
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'historico_tratamento_tratamentoId_fkey'
  ) THEN
    ALTER TABLE "historico_tratamento"
      ADD CONSTRAINT "historico_tratamento_tratamentoId_fkey"
      FOREIGN KEY ("tratamentoId") REFERENCES "tratamento"("id")
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'historico_tratamento_usuarioId_fkey'
  ) THEN
    ALTER TABLE "historico_tratamento"
      ADD CONSTRAINT "historico_tratamento_usuarioId_fkey"
      FOREIGN KEY ("usuarioId") REFERENCES "user"("id")
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;
