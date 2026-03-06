import { Book } from "../types/book.type";

export const books:Book[] = [
 {id:"1",title:"Book One"},
        {id:"2",title:"Book Two"},
        {id:"3",title:"Book Three",date:"2024-06-01" },
]

export interface IBookRepository{
    getAllBooks():Book[];
    createBook(book: Book): Book;     // FIXED
    getBookById?(id:string):Book | undefined;
}

export class BookRepository implements IBookRepository{
    createBook(book: Book): Book {
        books.push(book)
       return book;
    }
    
    
    getAllBooks(): Book[] {
        return books;
    }


     getBookById?(id:string):Book|undefined{
        return books.find(book => book.id ===id);
     }
    
}