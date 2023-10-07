import { prisma } from '@/config';

async function findBooking(userId: number) {
    return prisma.booking.findFirst({
      where: {
        userId,
      },
      include: {
        Room: true,
      }
    })
}

async function listRooms (roomId: number){
    return prisma.room.findUnique({
        where:{
            id: roomId, 
        },
        include: {
          Booking: true
        }
    })
}

async function creatingBooking(userId:number, roomId:number){
    return prisma.booking.create({
        data:{
            roomId,
            userId
        }
    })

}

async function updateBooking(userId:number,roomId: number, bookingId:number){
    return prisma.booking.update({
        where:{
            id: bookingId,

        },
        data: {
            roomId,
            userId,
            updatedAt: new Date(),
          },
    })
}




export const bookingRepository = {
findBooking,
creatingBooking,
listRooms,
updateBooking
}