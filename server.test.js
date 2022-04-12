const request = require("supertest")
const app = require('./server')


/* Outline
describe("GET/POST/PUT/DELETE /path", () => {
	test("description", async () => {
		const login = await request(app).post("/login").send({
			username: "your",
			password: "mom"
	})      
	
	cookie = login.headers['set-cookie'];
	
		const response = await request(app).whatever.set('cookie', cookie)
		expect(response.statusCode).toBe();
	})
})
*/

///////////////////////////////////
// EVENTS

describe("GET /events ", () => {
  test("No authentication should return 401", async () => {
    const response = await request(app).get("/events")
    expect(response.statusCode).toBe(401);
  })
})

describe("GET /events ", () => {
  test("Get all user's events (authenticated)", async () => {
	  const login = await request(app).post("/login").send({
			username: "your",
			password: "mom"
	})
	
	cookie = login.headers['set-cookie'];
	
    const response = await request(app).get("/events").set('cookie', cookie)
    expect(response.statusCode).toBe(200);
  })
})

describe("POST /events GET /events/:eventId and then DELETE /events/:eventId", () => {
  test("Creates a new event, gets it, and then deletes it", async () => {
	  const login = await request(app).post("/login").send({
			username: "your",
			password: "mom"
	})      
	
	cookie = login.headers['set-cookie']; 
	
    const response = await request(app).post("/events").send({
		name: "movienight",
		description: "movie night with the boys",
		tags: "movie",
		address: "1333 something lane",
		date: "04-20-2022"
	}).set('cookie', cookie)
	
    expect(response.statusCode).toBe(200);
	
	expect(response.body.newEvent.name).toEqual("movienight");
	expect(response.body.newEvent.description).toEqual("movie night with the boys");
	expect(response.body.newEvent.tags[0]).toEqual("movie");
	expect(response.body.newEvent.address).toEqual("1333 something lane");
	expect(response.body.newEvent.date).toEqual("2022-04-20T04:00:00.000Z");
	
	id = response.body.newEvent._id;
	
	const check = await request(app).get(`/events/${id}`).set('cookie', cookie)
	expect(check.statusCode).toBe(200)
	expect(check.body.currEvent.name).toEqual("movienight")
	
	const update = await request(app).put(`/events/${id}`).send({
			name: "movienighttest",
			description: "movie night with the boys",
			tags: "movie",
			address: "1333 something lane",
			date: "04-22-2022"
		}).set('cookie', cookie)
			
		expect(update.statusCode).toBe(200);
		expect(update.body.updatedEvent.name).toEqual("movienighttest")
		expect(update.body.updatedEvent.date).toEqual("2022-04-22T04:00:00.000Z")
	
	const del = await request(app).delete(`/events/${id}`).set('cookie', cookie)
	
	expect(del.statusCode).toBe(200)
  })
})

describe("POST /events/:eventId/guests/:guestId, GET /events/:eventId/guests, DELETE /events/:eventId/guests/:guestId", () => {
	test("Creates an event, adds a guest to it, gets the guest, deletes the guest and event", async () => {
	const login = await request(app).post("/login").send({
			username: "your",
			password: "mom"
		})   
		
		cookie = login.headers['set-cookie'];
		
		const newEv = await request(app).post("/events").send({
		name: "testing tasks",
		description: "event to test tasks",
		tags: "test",
		address: "1333 something lane",
		date: "04-20-2022"
		}).set('cookie', cookie)
	
		expect(newEv.statusCode).toBe(200);
		id = newEv.body.newEvent._id
		
		const response = await request(app).post(`/events/${id}/guests/6251ea712b3cc649cba328d8`).set('cookie', cookie)
		
		expect(response.statusCode).toBe(200);
		expect(response.body.newGuest.lastName).toEqual("Pie")
		
		const check = await request(app).get(`/events/${id}/guests`).set('cookie', cookie)
		
		expect(check.statusCode).toBe(200);
		expect(check.body.guests[0].lastName).toEqual("Pie")
		
		const del = await request(app).delete(`/events/${id}/guests/6251ea712b3cc649cba328d8`).set('cookie', cookie)
		
		expect(del.statusCode).toBe(200);
		
		const delE = await request(app).delete(`/events/${id}`).set('cookie', cookie)
	
		expect(delE.statusCode).toBe(200)
	})
})

describe("POST /events/:eventId/tasks then PUT, GET, and DELETE /events/:eventId/tasks/:taskId", () => {
	test("Creates an event, adds a task to it, gets it, updates it, then deletes the task and event", async () => {
		const login = await request(app).post("/login").send({
			username: "your",
			password: "mom"
		})   
		
		cookie = login.headers['set-cookie'];
		
		const newEv = await request(app).post("/events").send({
		name: "testing tasks",
		description: "event to test tasks",
		tags: "test",
		address: "1333 something lane",
		date: "04-20-2022"
		}).set('cookie', cookie)
	
		expect(newEv.statusCode).toBe(200);
		id = newEv.body.newEvent._id
		
		const response = await request(app).post(`/events/${id}/tasks`).send({
			name: "Bring cookies",
			description: "bring chocolate chip and sugar cookies",
			assignees: "6251ea712b3cc649cba328d8"
			
		}).set('cookie', cookie)
		expect(response.statusCode).toBe(200);
		expect(response.body.retval.tasks[0].name).toEqual("Bring cookies")
		
		const check = await request(app).get(`/events/${id}/tasks`).set('cookie', cookie)
		expect(check.statusCode).toBe(200)
		expect(check.body.tasks[0].name).toEqual("Bring cookies")
		
		taskId = response.body.retval.tasks[0]._id
		
		const cTask = await request(app).put(`/events/${id}/tasks/${taskId}`).send({
			name: "test",
			description: "bring chocolate chip and sugar cookies",
			assignees: "6251ea712b3cc649cba328d8",
			done: "false"
		}).set('cookie', cookie)
		expect(cTask.statusCode).toBe(200);
		
		const check2 = await request(app).get(`/events/${id}/tasks`).set('cookie', cookie)
		expect(check2.statusCode).toBe(200)
		expect(check2.body.tasks[0].name).toEqual("test")
		
		const del = await request(app).delete(`/events/${id}/tasks/${taskId}`).set('cookie', cookie)
		expect(del.statusCode).toBe(200)
		
		const delE = await request(app).delete(`/events/${id}`).set('cookie', cookie)
	
		expect(delE.statusCode).toBe(200)
	})
})

///////////////////////////////////
// USERS
describe("LOGIN /login", () => {
	test("Login a user", async () => {
		const response = await request(app).post("/login").send({
			username: "your",
			password: "mom"
	})
	
	expect(response.body.user.firstName).toEqual("your");
	expect(response.body.user.lastName).toEqual("mom");
	expect(response.statusCode).toBe(200);
	})
})

describe("GET /account ", () => {
  test("Get user's account info", async () => {
	  const login = await request(app).post("/login").send({
			username: "your",
			password: "mom"
	})
	
	cookie = login.headers['set-cookie'];
	
    const response = await request(app).get("/account").set('cookie', cookie)
    expect(response.statusCode).toBe(200);
	expect(response.body.user.firstName).toEqual("your")
	expect(response.body.user.lastName).toEqual("mom")
  })
})

describe("GET /friends ", () => {
  test("Get user's friends", async () => {
	  const login = await request(app).post("/login").send({
			username: "your",
			password: "mom"
	})
	
	cookie = login.headers['set-cookie'];
	
    const response = await request(app).get("/friends").set('cookie', cookie)
    expect(response.statusCode).toBe(200);
  })
})

describe("POST /friends/:friendId GET it and then DELETE", () => {
  test("Add a friend and then delete them", async () => {
	  const login = await request(app).post("/login").send({
			username: "your",
			password: "mom"
	})
	
	cookie = login.headers['set-cookie'];
	
    const response = await request(app).post("/friends/6251ea712b3cc649cba328d8").set('cookie', cookie)
    expect(response.statusCode).toBe(200);
	
	const check = await request(app).get("/friends/6251ea712b3cc649cba328d8").set('cookie', cookie)
    expect(check.statusCode).toBe(200);
	
	const del = await request(app).delete("/friends/6251ea712b3cc649cba328d8").set('cookie', cookie)
    expect(del.statusCode).toBe(200);
  })
})