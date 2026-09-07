ALTER TABLE "esteira_etapa" ADD COLUMN IF NOT EXISTS "clinicId" TEXT;

UPDATE "esteira_etapa"
SET "clinicId" = COALESCE(
  (SELECT id FROM "clinic" WHERE name = 'Grupo Sorria Goiânia' LIMIT 1),
  (SELECT id FROM "clinic" WHERE id = 'clinic-goiania' LIMIT 1)
)
WHERE "clinicId" IS NULL;

DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM "esteira_etapa" WHERE "clinicId" IS NULL
  ) THEN
    RAISE EXCEPTION 'Não foi possível vincular etapas à clínica Grupo Sorria Goiânia';
  END IF;
END $$;

ALTER TABLE "esteira_etapa" ALTER COLUMN "clinicId" SET NOT NULL;

DO $$ BEGIN
  ALTER TABLE "esteira_etapa" DROP CONSTRAINT IF EXISTS "esteira_etapa_ordem_key";
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "esteira_etapa"
    ADD CONSTRAINT "esteira_etapa_clinicId_fkey"
    FOREIGN KEY ("clinicId") REFERENCES "clinic"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "esteira_etapa"
    ADD CONSTRAINT "esteira_etapa_clinicId_ordem_key"
    UNIQUE ("clinicId", "ordem");
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE INDEX IF NOT EXISTS "esteira_etapa_clinicId_idx" ON "esteira_etapa"("clinicId");
