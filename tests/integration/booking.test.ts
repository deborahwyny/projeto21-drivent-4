import supertest from 'supertest'
import app, { init } from '@/app'
import { cleanDb, generateValidToken } from '../helpers'
import httpStatus from 'http-status'
import faker from '@faker-js/faker'
import * as jwt from "jsonwebtoken"
import { createEnrollmentWithAddress, createPayment, createUser, createTicketTypeWithHotel, createTicket, createBooking, createRooms } from '../factories'
import { createHotel, createRoomWithHotelId } from '../factories/hotels-factory'
import { TicketStatus } from '@prisma/client'
import { prisma } from '@/config'
import { bookingService } from '@/services/booking-service'


beforeAll(async () => {
    await init();
  })
  
  beforeEach(async () => {
    await cleanDb();
  })


const server = supertest(app)


////validação token


describe("POST / Booking", ()=>{

    it("Se receber token inválido, deve retornar 401 (Unauthorized)", async()=>{
        const retornar = await server.get('/booking');
        expect(retornar.status).toBe(httpStatus.UNAUTHORIZED)
    })
    it("Se receber token sem associação, deve retornar 401 (Unauthorized)", async()=>{
        const token = faker.lorem.word()
        const retornar = await server.get('/booking').set('Authorization', `Bearer ${token}`)
        expect(retornar.status).toBe(httpStatus.UNAUTHORIZED)
     
     })
     it("Se não receber token, deve retornar 401 (Unauthorized)", async()=>{
         const usuarioSemSessao = await createUser();
         const token = jwt.sign({ userId: usuarioSemSessao.id }, process.env.JWT_SECRET);
         const retornar = await server.get('/booking').set('Authorization', `Bearer ${token}`)
         expect(retornar.status).toBe(httpStatus.UNAUTHORIZED)
     })
     it('deve retornar com status 403 quando o usuário não tiver uma sessão', async () => {
        const user = await createUser()
        const token = await generateValidToken(user)
        const hotel = await createHotel()
        const room = await createRoomWithHotelId(hotel.id)
  
        const retornar = await server.post('/booking').set('Authorization', `Bearer ${token}`).send({ roomId: room.id })
        expect(retornar.status).toBe(403)
      })
      it('deve retornar com status 404 quando o ID do quarto enviado não existir', async () => {
        const user = await createUser()
        const token = await generateValidToken(user)
        const enrollment = await createEnrollmentWithAddress(user)
        const ticketType = await createTicketTypeWithHotel()
        const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID)
        await createPayment(ticket.id, ticketType.price)
        const hotel = await createHotel()
        await createRoomWithHotelId(hotel.id)
        const retornar = await server.post('/booking').set('Authorization', `Bearer ${token}`).send({ roomId: 999999 })
        expect(retornar.status).toBe(404)
      })
      it('deve responder com status 403 quando não possuir quartos disponiveis', async () => {
        const user = await createUser()
        const token = await generateValidToken(user)
        const enrollment = await createEnrollmentWithAddress(user)
        const ticketType = await createTicketTypeWithHotel()
        const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID)
        await createPayment(ticket.id, ticketType.price)
        const hotel = await createHotel()
        const room = await createRoomWithHotelId(hotel.id)
        await createBooking(enrollment.userId, room.id)
        const retornar = await server.post('/booking').set('Authorization', `Bearer ${token}`).send({ roomId: room.id })
        expect(retornar.status).toBe(403)
      })
      it('deve responder com status 200 e com um objeto contendo o ID da reserva', async () => {
        const user = await createUser()
        const token = await generateValidToken(user)
        const enrollment = await createEnrollmentWithAddress(user)
        const ticketType = await createTicketTypeWithHotel()
        const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
        await createPayment(ticket.id, ticketType.price)
        const hotel = await createHotel()
        const room = await createRoomWithHotelId(hotel.id)
        const beforeCount = await prisma.booking.count()
        const retornar = await server.post('/booking').set('Authorization', `Bearer ${token}`).send({ roomId: room.id })
        const afterCount = await prisma.booking.count()
        expect(beforeCount).toEqual(0)
        expect(afterCount).toEqual(1)
        expect(retornar.status).toBe(200)
        expect(retornar.body).toEqual({
          bookingId: expect.any(Number),
        })
      })

      it('deve responder com status 403 quando o usuário já tiver uma reserva ativa', async () => {
        const user = await createUser()
        const token = await generateValidToken(user)
        const hotel = await createHotel()
        const room = await createRoomWithHotelId(hotel.id)
        const enrollment = await createEnrollmentWithAddress(user)
        const ticketType = await createTicketTypeWithHotel()
        const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID)
        await createPayment(ticket.id, ticketType.price)
        await createBooking(user.id, room.id) // Reserva ativa
        const retornar = await server.post('/booking').set('Authorization', `Bearer ${token}`).send({ roomId: room.id })
        expect(retornar.status).toBe(403)
    })

    it('Deve lançar um erro forbiddenError quando o ticket está no status "RESERVED"', async () => {
      const userId = 1; // Substitua pelo ID de um usuário válido
      const reservedTicketId = 1; // Substitua pelo ID de um ticket que está no status "RESERVED"
      try {
          await bookingService.createBooking(userId, reservedTicketId);
          fail('Expected createBooking to throw forbiddenError');
      } catch (error) {
          expect(error.name).toEqual('forbiddenError');
          expect(error.message).toEqual('Forbidden');
      }
  });

  it('Deve lançar um erro forbiddenError quando o tipo de ticket não inclui hotel', async () => {
    const userId = 1; // Substitua pelo ID de um usuário válido
    const ticketWithoutHotelId = 1; // Substitua pelo ID de um ticket que não inclui hotel
    try {
        await bookingService.createBooking(userId, ticketWithoutHotelId);
        fail('Expected createBooking to throw forbiddenError');
    } catch (error) {
        expect(error.name).toEqual('forbiddenError');
        expect(error.message).toEqual('Forbidden');
    }
});



  
  
    })


describe("GET /booking", ()=>{

    it("Se receber token inválido, deve retornar 401 (Unauthorized)", async()=>{
        const retornar = await server.get('/booking');
        expect(retornar.status).toBe(httpStatus.UNAUTHORIZED)
    })
    it("Se receber token sem associação, deve retornar 401 (Unauthorized)", async()=>{
        const token = faker.lorem.word()
        const retornar = await server.get('/booking').set('Authorization', `Bearer ${token}`)
        expect(retornar.status).toBe(httpStatus.UNAUTHORIZED)
     
     })
     it("Se não receber token, deve retornar 401 (Unauthorized)", async()=>{
         const usuarioSemSessao = await createUser();
         const token = jwt.sign({ userId: usuarioSemSessao.id }, process.env.JWT_SECRET);
         const retornar = await server.get('/booking').set('Authorization', `Bearer ${token}`)
         expect(retornar.status).toBe(httpStatus.UNAUTHORIZED)
     })

     it('deve retornar com status 403 quando o usuário não tiver uma sessão', async () => {
        const user = await createUser()
        const token = await generateValidToken(user)
        const hotel = await createHotel()
        const room = await createRoomWithHotelId(hotel.id)
  
        const retornar = await server.post('/booking').set('Authorization', `Bearer ${token}`).send({ roomId: room.id });
        expect(retornar.status).toBe(403)
      })

      it('deve retornar com status 200 e com um objeto', async () => {
        const user = await createUser()
        const token = await generateValidToken(user)
        const enrollment = await createEnrollmentWithAddress(user)
        const ticketType = await createTicketTypeWithHotel()
        const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID)
        await createPayment(ticket.id, ticketType.price)
        const hotel = await createHotel()
        const room = await createRoomWithHotelId(hotel.id)
        const beforeCount = await prisma.booking.count()
        const retornar = await server.post('/booking').set('Authorization', `Bearer ${token}`).send({ roomId: room.id })
        const afterCount = await prisma.booking.count()
        expect(beforeCount).toEqual(0)
        expect(afterCount).toEqual(1)
        expect(retornar.status).toBe(200)
        expect(retornar.body).toEqual({
          bookingId: expect.any(Number),
        });
      });
    });
    it('deve responder com status 200 e com um objeto contendo o ID da reserva quando o usuário não tiver uma reserva ativa', async () => {
    const user = await createUser()
    const token = await generateValidToken(user)
    const hotel = await createHotel()
    const room = await createRoomWithHotelId(hotel.id)
    const enrollment = await createEnrollmentWithAddress(user)
    const ticketType = await createTicketTypeWithHotel()
    const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID)
    await createPayment(ticket.id, ticketType.price)
    const beforeCount = await prisma.booking.count()
    const retornar = await server.post('/booking').set('Authorization', `Bearer ${token}`).send({ roomId: room.id })
    const afterCount = await prisma.booking.count()
    expect(beforeCount).toEqual(0)
    expect(afterCount).toEqual(1)
    expect(retornar.status).toBe(200)
    expect(retornar.body).toEqual({
      bookingId: expect.any(Number),
    })
})
  
      it('deve responder status 404 quando o ID do quarto enviado não existir', async () => {
        const user = await createUser()
        const token = await generateValidToken(user)
        const enrollment = await createEnrollmentWithAddress(user)
        const ticketType = await createTicketTypeWithHotel()
        const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID)
        await createPayment(ticket.id, ticketType.price)
        const hotel = await createHotel()
        await createRoomWithHotelId(hotel.id)
        const retornar = await server.post('/booking').set('Authorization', `Bearer ${token}`).send({ roomId: 999999 })
        expect(retornar.status).toBe(404)
      })

describe("PUT / Booking", () =>{
    it("Se receber token inválido, deve retornar 401 (Unauthorized)", async()=>{
        const retornar = await server.get('/booking');
        expect(retornar.status).toBe(httpStatus.UNAUTHORIZED)
    })
    it("Se receber token sem associação, deve retornar 401 (Unauthorized)", async()=>{
        const token = faker.lorem.word()
        const retornar = await server.get('/booking').set('Authorization', `Bearer ${token}`)
        expect(retornar.status).toBe(httpStatus.UNAUTHORIZED)
     
     })
     it("Se não receber token, deve retornar 401 (Unauthorized)", async()=>{
         const usuarioSemSessao = await createUser();
         const token = jwt.sign({ userId: usuarioSemSessao.id }, process.env.JWT_SECRET);
         const retornar = await server.get('/booking').set('Authorization', `Bearer ${token}`)
         expect(retornar.status).toBe(httpStatus.UNAUTHORIZED)
     })
     it('deve retornar com status 404 quando o ID do quarto enviado não existir', async () => {
        const user = await createUser()
        const token = await generateValidToken(user)
        const enrollment = await createEnrollmentWithAddress(user)
        const ticketType = await createTicketTypeWithHotel()
        const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID)
        await createPayment(ticket.id, ticketType.price)
        const hotel = await createHotel()
        const room = await createRoomWithHotelId(hotel.id)
        const booking = await createBooking(enrollment.userId, room.id)
        const retornar = await server
        .put(`/booking/${booking.id}`).set('Authorization', `Bearer ${token}`).send({ roomId: 999999 })
        expect(retornar.status).toBe(httpStatus.NOT_FOUND)
      })
      it('deve retornar o status 403 quando estiver com a capacidade do quarto chea', async () => {
        const user = await createUser()
        const token = await generateValidToken(user)
        const enrollment = await createEnrollmentWithAddress(user)
        const ticketType = await createTicketTypeWithHotel()
        const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID)
        await createPayment(ticket.id, ticketType.price)
        const hotel = await createHotel()
        const room = await createRoomWithHotelId(hotel.id)
        const booking = await createBooking(enrollment.userId, room.id)
        const user2= await createUser()
        const user3= await createUser()


        const secondRoom = await createRooms(hotel.id, 2)
        await createBooking(user3.id,secondRoom.id)
        await createBooking(user2.id,secondRoom.id)
        const { statusCode } = await server
          .put(`/booking/${booking.id}`)
          .set('Authorization', `Bearer ${token}`)
          .send({ roomId: secondRoom.id })
          expect(statusCode).toBe(httpStatus.FORBIDDEN);
        })
      })

