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

async function listByRoomId (roomId: number) {
    return prisma.booking.findMany({
      where: {
        roomId,
      },
      include: {
        Room: true,
      },
    });
  }


async function activeBooking(userId: number){
   return prisma.booking.findFirst({
        where: {
            userId,
        },
})}

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

async function getUserById(userId: number){
  return await prisma.user.findUnique({
    where: {
      id: userId
    },
    select: {
      Booking: {
        select: {
          id: true,
          Room: true
        }
      },
      Enrollment: {
        select: {
          Ticket: {
            select: {
              status: true,
              TicketType: {
                select: {
                  includesHotel: true,
                  isRemote: true
                }
              }
            }
          }
        }
      }
    }
  });
};




export const bookingRepository = {
findBooking,
creatingBooking,
listRooms,
updateBooking,
activeBooking,
listByRoomId,
getUserById
}