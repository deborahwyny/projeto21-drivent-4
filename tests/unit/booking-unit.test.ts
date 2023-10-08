import { Booking, Enrollment, Hotel, Room, Ticket, TicketStatus, TicketType, User } from '@prisma/client';
import faker from '@faker-js/faker';
import {
    createBooking,
    createEnrollmentWithAddress,
    createUser,
    createTicket,
    createTicketTypeWithHotel,
    createPayment,
} from '../factories';
import { cleanDb } from '../helpers';
import { init } from '@/app';
import { bookingRepository } from '@/repositories/booking-repository';
import { bookingService } from '@/services/booking-service';
import { ticketsRepository } from '@/repositories';
import { createHotel, createRoomWithHotelId } from '../factories/hotels-factory';
import { TicketTypeTicket } from '@/protocols';






beforeAll(async () => {
    await init()
})

beforeEach(async () => {
    await cleanDb()
})

describe('All unit tests', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })
})

// describe('getBookingByUserId', () => {
//     it('should return the booking when it exists', async () => {
//         const mockUser: User = await createUser();
//         const mockEnrollment: Enrollment = await createEnrollmentWithAddress(mockUser)
//         const mockTicketType: TicketType = await createTicketTypeWithHotel()
//         const mockTicket: Ticket = await createTicket(mockEnrollment.id, mockTicketType.id, TicketStatus.PAID)
//         await createPayment(mockTicket.id, mockTicketType.price)
//         const mockHotel: Hotel = await createHotel()
//         const mockRoom: Room = await createRoomWithHotelId(mockHotel.id)
//         const mockBooking: Booking = await createBooking(mockUser.id, mockRoom.id)  
//         const ticket: TicketTypeTicket = {
//             id: mockBooking.id,
//             ticketTypeId: mockTicketType.id,
//             enrollmentId: mockEnrollment.id,
//             status: TicketStatus.PAID,
//             TicketType: {
//                 id: mockTicketType.id,
//                 name: faker.name.findName(),
//                 price: faker.datatype.number(),
//                 isRemote: true,
//                 includesHotel: true,
//                 createdAt: new Date(),
//                 updatedAt: new Date(),
//             },
//             createdAt: new Date(),
//             updatedAt: new Date(),
//         };    
//         jest.spyOn(bookingRepository, "listByRoomId").mockResolvedValue(mockBooking)

//       const userId = faker.datatype.number()
//       const result = await bookingService.listBooking(userId)

//       expect(result).toEqual(mockBooking)
//       expect(bookingRepository.listByRoomId).toHaveBeenCalledWith(userId)
//     });

//     it('should throw a 404 Not Found when the booking does not exist', async () => {
//       (bookingRepository.listByRoomId as jest.Mock).mockRejectedValue(undefined)

//       const userId = faker.datatype.number()

//       try {
//         await bookingService.listBooking(userId)
//         expect(true).toBe(false);
//       } catch (error) {
//         expect(error.statusCode).toBe(404)
//       }

//       expect(bookingRepository.listByRoomId).toHaveBeenCalledWith(userId);
//     });
//   });

it('Deve retornar um erro quando o ingresso é remoto', async () => {
    const mockUser: User = await createUser();
    const mockEnrollment: Enrollment = await createEnrollmentWithAddress(mockUser)
    const mockTicketType: TicketType = await createTicketTypeWithHotel()
    const mockTicket: Ticket = await createTicket(mockEnrollment.id, mockTicketType.id, TicketStatus.PAID)
    await createPayment(mockTicket.id, mockTicketType.price)
    const mockHotel: Hotel = await createHotel()
    const mockRoom: Room = await createRoomWithHotelId(mockHotel.id)
    const mockBooking: Booking = await createBooking(mockUser.id, mockRoom.id)
    const ticket: TicketTypeTicket = {
        id: mockBooking.id,
        ticketTypeId: mockTicketType.id,
        enrollmentId: mockEnrollment.id,
        status: TicketStatus.PAID,
        TicketType: {
            id: mockTicketType.id,
            name: faker.name.findName(),
            price: faker.datatype.number(),
            isRemote: true,
            includesHotel: true,
            createdAt: new Date(),
            updatedAt: new Date(),
        },
        createdAt: new Date(),
        updatedAt: new Date(),
    };
    jest.spyOn(ticketsRepository, 'findTicketByEnrollmentId').mockResolvedValue(ticket)

    try {
        await bookingService.createBooking(mockBooking.roomId, mockUser.id)
        fail('Expected createBooking to throw forbiddenError')
    } catch (error) {
        expect(error.name).toEqual('forbiddenError')
        expect(error.message).toEqual('Forbidden')
    }
})


it('Deve retornar um erro quando não inclui hotrl', async () => {
    const mockUser: User = await createUser()
    const mockEnrollment: Enrollment = await createEnrollmentWithAddress(mockUser)
    const mockTicketType: TicketType = await createTicketTypeWithHotel()
    const mockTicket: Ticket = await createTicket(mockEnrollment.id, mockTicketType.id, TicketStatus.PAID)
    await createPayment(mockTicket.id, mockTicketType.price)
    const mockHotel: Hotel = await createHotel()
    const mockRoom: Room = await createRoomWithHotelId(mockHotel.id)
    const mockBooking: Booking = await createBooking(mockUser.id, mockRoom.id)
    const ticket: TicketTypeTicket = {
        id: mockBooking.id,
        ticketTypeId: mockTicketType.id,
        enrollmentId: mockEnrollment.id,
        status: TicketStatus.PAID,
        TicketType: {
            id: mockTicketType.id,
            name: faker.name.findName(),
            price: faker.datatype.number(),
            isRemote: false,
            includesHotel: false,
            createdAt: new Date(),
            updatedAt: new Date(),
        },
        createdAt: new Date(),
        updatedAt: new Date(),
    };
    jest.spyOn(ticketsRepository, 'findTicketByEnrollmentId').mockResolvedValue(ticket)

    try {
        await bookingService.createBooking(mockBooking.roomId, mockUser.id)
        fail('Expected createBooking to throw forbiddenError')
    } catch (error) {
        expect(error.name).toEqual('forbiddenError')
        expect(error.message).toEqual('Forbidden')
    }
})


// it('Deve criar um booking quando todas as condições foram atendidas', async () => {
//     const mockRoom = { id: faker.datatype.number(), capacity: 3 }
//     const mockBookings = [{ id: faker.datatype.number() }, { id: faker.datatype.number() }];
//     (bookingRepository.listRooms as jest.Mock).mockResolvedValue(mockRoom)
//     (bookingRepository.listRooms as jest.Mock).mockResolvedValue(mockBookings)
//     const params = { userId: faker.datatype.number(), roomId: faker.datatype.number() }

//     const mockResult = { id: faker.datatype.number(), roomId: params.roomId, userId: params.userId };
//     (bookingRepository.creatingBooking as jest.Mock).mockResolvedValue(mockResult)

//     const result = await bookingService.createBooking(params.userId,params.userId)

//     expect(result).toEqual(mockResult);
//     expect(bookingRepository.creatingBooking).toHaveBeenCalledWith(params)
//   })


it('Deve retornar erro quando o ticket não tiver sido pago', async () => {
    const mockUser: User = await createUser()
    const mockEnrollment: Enrollment = await createEnrollmentWithAddress(mockUser)
    const mockTicketType: TicketType = await createTicketTypeWithHotel()
    const mockTicket: Ticket = await createTicket(mockEnrollment.id, mockTicketType.id, TicketStatus.PAID)
    await createPayment(mockTicket.id, mockTicketType.price)
    const mockHotel: Hotel = await createHotel()
    const mockRoom: Room = await createRoomWithHotelId(mockHotel.id)
    const mockBooking: Booking = await createBooking(mockUser.id, mockRoom.id)
    const ticket: TicketTypeTicket = {
        id: mockBooking.id,
        ticketTypeId: mockTicketType.id,
        enrollmentId: mockEnrollment.id,
        status: TicketStatus.RESERVED,
        TicketType: {
            id: mockTicketType.id,
            name: faker.name.findName(),
            price: faker.datatype.number(),
            isRemote: false,
            includesHotel: true,
            createdAt: new Date(),
            updatedAt: new Date(),
        },
        createdAt: new Date(),
        updatedAt: new Date(),
    };
    jest.spyOn(ticketsRepository, 'findTicketByEnrollmentId').mockResolvedValue(ticket)

    try {
        await bookingService.createBooking(mockBooking.roomId, mockUser.id)
        fail('Expected createBooking to throw forbiddenError')
    } catch (error) {
        expect(error.name).toEqual('forbiddenError')
        expect(error.message).toEqual('Forbidden')
    }
})

it('Deve retornar um erro quando o quarto escolhido para atualizar não pertence ao cliente', async () => {
    const mockUser: User = await createUser()
    const mockHotel: Hotel = await createHotel()
    const mockRoom: Room = await createRoomWithHotelId(mockHotel.id)
    const mockBooking: Booking = await createBooking(mockUser.id, mockRoom.id)

    jest.spyOn(bookingRepository, 'updateBooking').mockResolvedValue(null)

    try {
        await bookingService.editBooking(mockBooking.roomId, mockUser.id, mockBooking.id)
        fail('Expected createBooking to throw forbiddenError')
    } catch (error) {
        expect(error.name).toEqual('forbiddenError')
        expect(error.message).toEqual('Forbidden')
    }
});

