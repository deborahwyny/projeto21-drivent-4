import { forbiddenError, notFoundError } from "@/errors";
import { enrollmentRepository, ticketsRepository } from "@/repositories";
import { bookingRepository } from "@/repositories/booking-repository"


async function listBooking(userId: number) {
    const booking = await bookingRepository.findBooking(userId)
    if (!booking) throw notFoundError();
  
    return booking;
}

async function createBooking(userId:number, roomId: number){

    /// verificar se o cliente possui inscrição 
    const enrollment = await enrollmentRepository.findWithAddressByUserId(userId)
    if (!enrollment) throw forbiddenError()
    const ticket = await ticketsRepository.findTicketByEnrollmentId(enrollment.id)
    if (
        !ticket ||
        ticket.status === 'RESERVED' ||
        ticket.TicketType.isRemote ||
        !ticket.TicketType.includesHotel 
      ) {
        throw forbiddenError() 
      }

      const ativo = await bookingRepository.activeBooking(userId)
      if(ativo){
        throw forbiddenError() 

      }

      //// verfificar quarto e capicidade
    const room = await bookingRepository.listRooms(roomId)
    if (!room) throw notFoundError()

    if(room.Booking.length >= room.capacity) {
      throw forbiddenError() //// FIXME: criar erro
    }

    const booking = await bookingRepository.creatingBooking(userId, roomId)
    return booking;

}

async function editBooking(userId:number,roomId: number, bookingId:number){
   /// verificar se o cliente possui inscrição 
   const enrollment = await enrollmentRepository.findWithAddressByUserId(userId)
   if (!enrollment) throw forbiddenError()//// FIXME: criar erro
   const ticket = await ticketsRepository.findTicketByEnrollmentId(enrollment.id)
   if (
       !ticket ||
       ticket.status === 'RESERVED' ||
       ticket.TicketType.isRemote ||
       !ticket.TicketType.includesHotel 
     ) {
       throw forbiddenError() //// FIXME: criar erro
     }

  const room = await bookingRepository.listRooms(roomId)
  if (!room) throw notFoundError()

  if(room.Booking.length >= room.capacity) {
      throw forbiddenError() //// FIXME: criar erro
    }

  


  const booking = await bookingRepository.updateBooking(userId,roomId, bookingId) 
  return booking;

}



export const bookingService = {
    listBooking,
    createBooking, 
    editBooking
}