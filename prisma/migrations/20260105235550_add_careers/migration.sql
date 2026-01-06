-- CreateTable
CREATE TABLE "careers" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "careers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "careers_name_key" ON "careers"("name");

-- CreateIndex
CREATE UNIQUE INDEX "careers_code_key" ON "careers"("code");

-- Insert initial careers
INSERT INTO "careers" ("id", "name", "code", "is_active", "created_at", "updated_at")
VALUES
    (gen_random_uuid(), 'Telecomunicaciones', 'TELECO', true, NOW(), NOW()),
    (gen_random_uuid(), 'Biomédica', 'BIOMED', true, NOW(), NOW());
