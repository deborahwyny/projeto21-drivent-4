import { prisma } from "@/config"
import faker from '@faker-js/faker'

export async function createTicketTypeWithHotel() {
    return prisma.ticketType.create({
        data: {
            name: faker.name.findName(),
            price: faker.datatype.number(),
            isRemote: false,
            includesHotel: true,
        },
    });
}

export async function createBooking(userId: number, roomId: number) {
    return prisma.booking.create({
        data: {
            userId,
            roomId,
        }
    })
}

export async function createRooms(hotelId: number, capacity?: number) {
    return await prisma.room.create({
      data: {
        hotelId,
        capacity: capacity ?? faker.datatype.number({ min: 2 }),
        name: faker.commerce.department(),
        createdAt: faker.date.recent(),
        updatedAt: faker.date.future(),
      },
    });
  }
  
