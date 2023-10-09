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
import { enrollmentRepository, ticketsRepository } from '@/repositories';
import { createHotel, createRoomWithHotelId } from '../factories/hotels-factory';
import { TicketTypeTicket } from '@/protocols';
import { notFoundError } from '@/errors';
import { AuthenticatedRequest } from '@/middlewares';






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

it('Deve retornar o booling quando o usario for valido', async () => {
    const userId = 1
    const mockBooking = { id: 1, userId, roomId: 2 }
    bookingRepository.findBooking = jest.fn().mockResolvedValue(mockBooking)

    const result = await bookingService.listBooking(userId)

    expect(result).toEqual(mockBooking)
  })

 

it("Deve retornar o booking quando cliente possuir um", async () => {
    const bookingData = { 
      id: 1,
      Room: { }
    };
    jest.spyOn(bookingRepository, "findBooking").mockImplementationOnce((): any => {
      return bookingData;
    })
    const promise = bookingService.listBooking(1)
    expect(promise).resolves.toEqual(bookingData)
})

it("Deve retornar um erro se o cliente não possuir um enrollment", async () => {
    jest.spyOn(bookingRepository, "listRooms").mockImplementationOnce((): any => {
      return {
        capacity: 10,
        _count: {
          Booking: 1
        }
      };
    });
    jest.spyOn(bookingRepository, "findBooking").mockImplementationOnce((): any => {
      return {
        Booking: null,
        Enrollment: []
      };
    });
    const promise = bookingService.createBooking(1, 1);
    expect(promise).rejects.toEqual({
      name: 'forbiddenError', 
      message: 'Forbidden',
    })
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
})



