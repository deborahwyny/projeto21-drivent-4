import { AuthenticatedRequest } from '@/middlewares';
import { bookingService } from '@/services/booking-service';
import { Request, Response, response } from 'express';
import httpStatus from 'http-status';

export async function getBooking(req: AuthenticatedRequest, res:Response){

    const userId = req.userId

    const booking = await bookingService.listBooking(userId)
    return res.status(httpStatus.OK).send(booking)

}

export async function postBooking(req: AuthenticatedRequest, res: Response){
    const userId = req.userId
    const {roomId} = req.body

    const booking = await bookingService.createBooking(userId, Number(roomId))
    const bookingId = booking.id
    return res.status(200).json({bookingId:bookingId})

}

export async function putBooking (req:AuthenticatedRequest, res:Response){
    const userId = req.userId
    const {roomId} = req.body
    const {bookingId} = req.params 
    const bookingString = `"${bookingId}"`; // Colocar aspas duplas ao redor do valor

    // const { bookingId } = req.params


    const booking = await bookingService.editBooking(Number(userId),Number(roomId),Number(bookingId) )
    return res.status(200).json({ "bookingId": bookingString });

}