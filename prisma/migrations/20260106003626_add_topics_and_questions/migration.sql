-- CreateEnum
CREATE TYPE "QuestionType" AS ENUM ('multiple_choice', 'numeric', 'graph_click', 'image_hotspot', 'open_text');

-- CreateEnum
CREATE TYPE "Difficulty" AS ENUM ('easy', 'medium', 'hard');

-- CreateTable
CREATE TABLE "topics" (
    "id" TEXT NOT NULL,
    "subject_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "topics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "questions" (
    "id" TEXT NOT NULL,
    "teacher_id" TEXT NOT NULL,
    "subject_id" TEXT,
    "topic_id" TEXT,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "question_type" "QuestionType" NOT NULL,
    "type_config" JSONB NOT NULL,
    "difficulty" "Difficulty" NOT NULL DEFAULT 'medium',
    "estimated_time_minutes" INTEGER,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "weight" INTEGER NOT NULL DEFAULT 1,
    "times_used" INTEGER NOT NULL DEFAULT 0,
    "average_score" DOUBLE PRECISION,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "questions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "topics_subject_id_idx" ON "topics"("subject_id");

-- CreateIndex
CREATE UNIQUE INDEX "topics_subject_id_name_key" ON "topics"("subject_id", "name");

-- CreateIndex
CREATE INDEX "questions_teacher_id_idx" ON "questions"("teacher_id");

-- CreateIndex
CREATE INDEX "questions_subject_id_idx" ON "questions"("subject_id");

-- CreateIndex
CREATE INDEX "questions_topic_id_idx" ON "questions"("topic_id");

-- CreateIndex
CREATE INDEX "questions_question_type_idx" ON "questions"("question_type");

-- CreateIndex
CREATE INDEX "questions_difficulty_idx" ON "questions"("difficulty");

-- AddForeignKey
ALTER TABLE "topics" ADD CONSTRAINT "topics_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "subjects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "questions" ADD CONSTRAINT "questions_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "questions" ADD CONSTRAINT "questions_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "subjects"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "questions" ADD CONSTRAINT "questions_topic_id_fkey" FOREIGN KEY ("topic_id") REFERENCES "topics"("id") ON DELETE SET NULL ON UPDATE CASCADE;
