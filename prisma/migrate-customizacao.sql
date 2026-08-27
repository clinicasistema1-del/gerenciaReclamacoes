CREATE TABLE IF NOT EXISTS "motivo" (
  "id" TEXT NOT NULL,
  "descricao" TEXT NOT NULL,
  CONSTRAINT "motivo_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "motivo_descricao_key" ON "motivo"("descricao");

INSERT INTO "motivo" ("id", "descricao") VALUES
  ('ATENDIMENTO', 'Atendimento'),
  ('COBRANCA', 'Cobrança'),
  ('QUALIDADE_TRATAMENTO', 'Qualidade do tratamento'),
  ('AGENDAMENTO', 'Agendamento'),
  ('FINANCEIRO', 'Financeiro'),
  ('OUTRO', 'Outro')
ON CONFLICT ("id") DO NOTHING;

CREATE TABLE IF NOT EXISTS "servico" (
  "id" TEXT NOT NULL,
  "descricao" TEXT NOT NULL,
  CONSTRAINT "servico_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "servico_descricao_key" ON "servico"("descricao");

INSERT INTO "servico" ("id", "descricao") VALUES
  ('IMPLANTE', 'Implante'),
  ('RESTAURACAO', 'Restauração'),
  ('PROTESE', 'Prótese')
ON CONFLICT ("id") DO NOTHING;

ALTER TABLE "reclamacao" ADD COLUMN IF NOT EXISTS "motivoId" TEXT;
ALTER TABLE "reclamacao" ADD COLUMN IF NOT EXISTS "servicoId" TEXT;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'reclamacao'
      AND column_name = 'motivo'
  ) THEN
    EXECUTE 'UPDATE "reclamacao" SET "motivoId" = "motivo"::text WHERE "motivoId" IS NULL';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'reclamacao'
      AND column_name = 'servico'
      AND udt_name = 'text'
  ) THEN
    UPDATE "reclamacao" r
    SET "servicoId" = s.id
    FROM "servico" s
    WHERE r."servicoId" IS NULL
      AND r.servico IS NOT NULL
      AND lower(trim(r.servico)) = lower(s.descricao);

    UPDATE "reclamacao"
    SET "servicoId" = 'PROTESE'
    WHERE "servicoId" IS NULL
      AND servico IS NOT NULL
      AND lower(trim(servico)) IN ('protese', 'prótese');

    UPDATE "reclamacao"
    SET "servicoId" = 'RESTAURACAO'
    WHERE "servicoId" IS NULL
      AND servico IS NOT NULL
      AND lower(trim(servico)) IN ('restauracao', 'restauração');

    UPDATE "reclamacao"
    SET "servicoId" = 'IMPLANTE'
    WHERE "servicoId" IS NULL
      AND servico IS NOT NULL
      AND lower(trim(servico)) = 'implante';
  END IF;
END $$;

UPDATE "reclamacao" SET "motivoId" = 'OUTRO' WHERE "motivoId" IS NULL;

ALTER TABLE "reclamacao" ALTER COLUMN "motivoId" SET NOT NULL;

ALTER TABLE "reclamacao" DROP COLUMN IF EXISTS "motivo";
ALTER TABLE "reclamacao" DROP COLUMN IF EXISTS "servico";

ALTER TABLE "reclamacao" DROP CONSTRAINT IF EXISTS "reclamacao_motivoId_fkey";
ALTER TABLE "reclamacao" ADD CONSTRAINT "reclamacao_motivoId_fkey"
  FOREIGN KEY ("motivoId") REFERENCES "motivo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "reclamacao" DROP CONSTRAINT IF EXISTS "reclamacao_servicoId_fkey";
ALTER TABLE "reclamacao" ADD CONSTRAINT "reclamacao_servicoId_fkey"
  FOREIGN KEY ("servicoId") REFERENCES "servico"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX IF NOT EXISTS "reclamacao_motivoId_idx" ON "reclamacao"("motivoId");
CREATE INDEX IF NOT EXISTS "reclamacao_servicoId_idx" ON "reclamacao"("servicoId");

DROP TYPE IF EXISTS "MotivoReclamacao";
