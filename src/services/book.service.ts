import { BookRepository,IBookRepository } from "../repositories/book.repository";
import { Book } from "../types/book.type";
import { CreateBookDTO } from "../dtos/book.dto";


let bookrepository: IBookRepository = new BookRepository()
 export class  BookService{
    getAllBooks():Book[]{
    let response :Book[]=
    bookrepository.getAllBooks().map((book:Book) =>{
        return{
            ...book,
            title:book.title.toUpperCase()
        };
    });
    return response
}
 createBook(bookDTO: CreateBookDTO): Book {
    const newBook: Book = {
      id: bookDTO.id,
      title: bookDTO.title,
    };

    const existingBook = bookrepository.getBookById?.(newBook.id);

    if (existingBook) {
      throw new Error(`${newBook.id} already exists`);
    }

    return bookrepository.createBook(newBook);
  }

  getBookById(id: string): Book {
  const book = bookrepository.getBookById?.(id);

  if (!book) {
    throw new Error("Book not found");
  }

  return {
    ...book,
    title: book.title.toUpperCase(),
  };
}




 }

