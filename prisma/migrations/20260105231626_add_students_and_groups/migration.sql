-- CreateTable
CREATE TABLE "students" (
    "id" TEXT NOT NULL,
    "teacher_id" TEXT NOT NULL,
    "full_name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "year" TEXT,
    "career" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "students_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "groups" (
    "id" TEXT NOT NULL,
    "teacher_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "year" TEXT NOT NULL,
    "career" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "student_groups" (
    "id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "group_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "student_groups_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "students_teacher_id_idx" ON "students"("teacher_id");

-- CreateIndex
CREATE UNIQUE INDEX "students_teacher_id_email_key" ON "students"("teacher_id", "email");

-- CreateIndex
CREATE INDEX "groups_teacher_id_idx" ON "groups"("teacher_id");

-- CreateIndex
CREATE UNIQUE INDEX "groups_teacher_id_name_year_key" ON "groups"("teacher_id", "name", "year");

-- CreateIndex
CREATE INDEX "student_groups_student_id_idx" ON "student_groups"("student_id");

-- CreateIndex
CREATE INDEX "student_groups_group_id_idx" ON "student_groups"("group_id");

-- CreateIndex
CREATE UNIQUE INDEX "student_groups_student_id_group_id_key" ON "student_groups"("student_id", "group_id");

-- AddForeignKey
ALTER TABLE "students" ADD CONSTRAINT "students_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "groups" ADD CONSTRAINT "groups_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_groups" ADD CONSTRAINT "student_groups_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_groups" ADD CONSTRAINT "student_groups_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;
