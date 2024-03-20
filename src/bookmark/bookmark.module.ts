import { Module } from '@nestjs/common';
import { BookmarkController } from './bookmark.controller';
import { Bookmark } from './bookmark';

@Module({
  controllers: [BookmarkController],
  providers: [Bookmark],
})
export class BookmarkModule {}
