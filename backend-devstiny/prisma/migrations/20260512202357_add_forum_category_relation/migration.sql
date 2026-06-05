-- AddForeignKey
ALTER TABLE "ForumThread" ADD CONSTRAINT "ForumThread_category_fkey" FOREIGN KEY ("category") REFERENCES "ForumCategory"("slug") ON DELETE RESTRICT ON UPDATE CASCADE;
