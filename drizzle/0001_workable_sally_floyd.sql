ALTER TABLE "batches" ADD COLUMN "thumbnail" text;--> statement-breakpoint
ALTER TABLE "batches" ADD COLUMN "description" text;--> statement-breakpoint
ALTER TABLE "batches" ADD COLUMN "price_inr" integer;--> statement-breakpoint
ALTER TABLE "batches" ADD CONSTRAINT "batches_exam_id_name_unique" UNIQUE("exam_id","name");--> statement-breakpoint
ALTER TABLE "gallery_images" ADD CONSTRAINT "gallery_images_exam_id_url_unique" UNIQUE("exam_id","url");--> statement-breakpoint
ALTER TABLE "subjects" ADD CONSTRAINT "subjects_batch_id_name_unique" UNIQUE("batch_id","name");--> statement-breakpoint
ALTER TABLE "test_forms" ADD CONSTRAINT "test_forms_exam_id_set_name_unique" UNIQUE("exam_id","set_name");