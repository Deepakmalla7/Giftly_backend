import { Request,Response } from "express";
import { Book } from "../types/book.type";
import { CreateBookDTO } from "../dtos/book.dto";

import { BookService } from "../services/book.service";
//



let bookService :BookService = new BookService();
export class BookController {


    createBook= (req:Request,res:Response) =>{
    try {
        const validation =CreateBookDTO.safeParse(req.body);
        if(!validation.success){
            return res.status(400).json({errors:validation.error})
            }

        const{id,title}= validation.data;
        const newBook:Book = bookService.createBook({id,title}) 
        return res.status(201).json(newBook);

        
    } catch (error:Error |any) {
        return res.status(400).send(error.message?? "Something went wrong")
        
    }         
    }
 

    getBooks = (
        req:Request,
        res:Response
    )=>{
    const return_book:Book[]= bookService.getAllBooks()
    return res.json(return_book);
    }

   getBookById = (req: Request, res: Response) => {
    try {
      const bookid = req.params.bookid;

      const book = bookService.getBookById(bookid);

      return res.status(201).json(book)

    } catch (error: any) {
    return res.status(400).send(error.message?? "Something went wrong")

    }
  };
}