ALTER TABLE "products" ADD COLUMN "department" text DEFAULT 'unisex' NOT NULL;--> statement-breakpoint
CREATE INDEX "products_department_idx" ON "products" USING btree ("department");--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_department_check" CHECK ("products"."department" in ('women', 'men', 'unisex'));