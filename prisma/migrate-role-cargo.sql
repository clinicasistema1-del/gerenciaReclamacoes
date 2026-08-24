-- Migra Role/Cargo: perfil ADMIN|PADRAO e cargo no usuario/esteira

DO $$ BEGIN
  CREATE TYPE "Cargo" AS ENUM ('SAC', 'DENTISTA', 'SECRETARIA', 'COORDENADOR', 'GERENCIA', 'DIRETORIA');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "cargo" "Cargo";

UPDATE "user" SET "cargo" = CASE
  WHEN "role"::text = 'SAC' THEN 'SAC'::"Cargo"
  WHEN "role"::text = 'DENTISTA' THEN 'DENTISTA'::"Cargo"
  WHEN "role"::text = 'COORDENACAO' THEN 'COORDENADOR'::"Cargo"
  WHEN "role"::text = 'GERENCIA' THEN 'GERENCIA'::"Cargo"
  WHEN "role"::text = 'DIRETORIA' THEN 'DIRETORIA'::"Cargo"
  WHEN "role"::text = 'AUDITORIA' THEN 'COORDENADOR'::"Cargo"
  WHEN "role"::text = 'SECRETARIA' THEN 'SECRETARIA'::"Cargo"
  ELSE "cargo"
END
WHERE "role"::text <> 'ADMIN';

ALTER TABLE "esteira_etapa" ADD COLUMN IF NOT EXISTS "cargoAlvo" "Cargo";

UPDATE "esteira_etapa" SET "cargoAlvo" = CASE
  WHEN "roleAlvo"::text = 'SAC' THEN 'SAC'::"Cargo"
  WHEN "roleAlvo"::text = 'DENTISTA' THEN 'DENTISTA'::"Cargo"
  WHEN "roleAlvo"::text = 'COORDENACAO' THEN 'COORDENADOR'::"Cargo"
  WHEN "roleAlvo"::text = 'GERENCIA' THEN 'GERENCIA'::"Cargo"
  WHEN "roleAlvo"::text = 'DIRETORIA' THEN 'DIRETORIA'::"Cargo"
  WHEN "roleAlvo"::text = 'AUDITORIA' THEN 'COORDENADOR'::"Cargo"
  WHEN "roleAlvo"::text = 'ADMIN' THEN 'DIRETORIA'::"Cargo"
  ELSE 'SAC'::"Cargo"
END
WHERE "cargoAlvo" IS NULL;

ALTER TABLE "esteira_etapa" ALTER COLUMN "cargoAlvo" SET DEFAULT 'SAC'::"Cargo";
UPDATE "esteira_etapa" SET "cargoAlvo" = 'SAC'::"Cargo" WHERE "cargoAlvo" IS NULL;
ALTER TABLE "esteira_etapa" ALTER COLUMN "cargoAlvo" SET NOT NULL;

ALTER TABLE "esteira_etapa" DROP COLUMN IF EXISTS "roleAlvo";

DO $$ BEGIN
  CREATE TYPE "Role_new" AS ENUM ('ADMIN', 'PADRAO');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE "user" ALTER COLUMN "role" DROP DEFAULT;

ALTER TABLE "user"
  ALTER COLUMN "role" TYPE "Role_new"
  USING (
    CASE
      WHEN "role"::text = 'ADMIN' THEN 'ADMIN'::"Role_new"
      ELSE 'PADRAO'::"Role_new"
    END
  );

DROP TYPE IF EXISTS "Role";
ALTER TYPE "Role_new" RENAME TO "Role";

ALTER TABLE "user" ALTER COLUMN "role" SET DEFAULT 'PADRAO'::"Role";
