ALTER TABLE "esteira_etapa" ADD COLUMN IF NOT EXISTS "prazoDias" INTEGER;
UPDATE "esteira_etapa"
SET "prazoDias" = GREATEST(1, CEIL(COALESCE("prazoHoras", 24)::numeric / 24))
WHERE "prazoDias" IS NULL;
ALTER TABLE "esteira_etapa" ALTER COLUMN "prazoDias" SET NOT NULL;
ALTER TABLE "esteira_etapa" DROP COLUMN IF EXISTS "prazoHoras";

ALTER TABLE "esteira_etapa" ADD COLUMN IF NOT EXISTS "usuarioId" TEXT;

UPDATE "esteira_etapa" e
SET "usuarioId" = COALESCE(
  (
    SELECT u.id FROM "user" u
    WHERE u.cargo::text = e."cargoAlvo"::text AND u.active = true
    ORDER BY u."createdAt" ASC
    LIMIT 1
  ),
  (SELECT id FROM "user" WHERE role = 'ADMIN' LIMIT 1),
  (SELECT id FROM "user" ORDER BY "createdAt" ASC LIMIT 1)
)
WHERE "usuarioId" IS NULL;

ALTER TABLE "esteira_etapa" ALTER COLUMN "usuarioId" SET NOT NULL;
ALTER TABLE "esteira_etapa" DROP COLUMN IF EXISTS "cargoAlvo";

DO $$ BEGIN
  ALTER TABLE "esteira_etapa"
    ADD CONSTRAINT "esteira_etapa_usuarioId_fkey"
    FOREIGN KEY ("usuarioId") REFERENCES "user"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
