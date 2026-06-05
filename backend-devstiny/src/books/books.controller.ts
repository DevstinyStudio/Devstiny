import { Controller, Get, Param } from '@nestjs/common';
import { BooksService } from './books.service.js';

@Controller('books')
export class BooksController {
  constructor(private readonly booksService: BooksService) {}

  @Get()
  listBooks() {
    return this.booksService.listBooks(true);
  }

  @Get(':slug')
  getBook(@Param('slug') slug: string) {
    return this.booksService.getBook(slug);
  }
}
