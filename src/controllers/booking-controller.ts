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
    const roomId = Number(req.body)

    const booking = await bookingService.createBooking(userId, roomId)
    return res.status(httpStatus.OK).send(booking.id)

}

export async function putBooking (req:AuthenticatedRequest, res:Response){
    const userId = req.userId
    const roomId = Number(req.body)
    const bookingId = Number(req.params)

    // const { bookingId } = req.params


    const booking = await bookingService.editBooking(userId,roomId,bookingId )
    return res.status(httpStatus.OK).send(bookingId)

}