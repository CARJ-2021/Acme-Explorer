const app = require("../index");
const chai = require("chai");
const chaiHttp = require("chai-http");
const idtoken_collector = require("./idtoken_collector");

var manager = {
    "name": "Manager1",
    "surname": "Manager1",
    "email": "manager1@yopmail.com",
    "password": "12345",
    "preferredLanguage": "en",
    "phone": "12345",
    "address": "Manager1 Address",
    "role": [
        "MANAGER"
    ],
    "banned": false
}

var trip_published = 
    {
    "title": "Test trip",
    "description": "This is a test trip",
    "requirements": [
        "Requirement 1",
        "Requirement 2"
    ],
    "startDate": "2021-06-07 17:00:00",
    "endDate": "2021-07-08 17:00:00",
    "published": true,
    "stages": [
        {
            "title": "Stage 1",
            "description": "This is a test stage",
            "price": 20
        },
        {
            "title": "Stage 2",
            "description": "This is another test stage",
            "price": 25.7
        }
    ]
}

var trip_not_published =  Object.assign({}, trip_published);;
trip_not_published.published = false;


const { expect } = chai;
chai.use(chaiHttp);
describe("Acme-explorer trips tests", () => {
  it("Create manager for tests", done => {
    chai
      .request(app)
      .post("/v1/actors")
      .send(manager)
      .end((err, res) => {
        manager.id = res.body._id;
        done();
      });
  });

  it("Create a published trip -v2", done => {
    idtoken_collector.getIdToken(manager.email).then(idtoken=>{
    chai
      .request(app)
      .post("/v2/trips")
      .send(trip_published)
      .set("idtoken", idtoken)
      .end((err, res) => {
        trip_published.id = res.body._id;
        expect(res).to.have.status(200);
        done();
      });
  });
  })


  it("Create a not published trip -v2", done => {
    idtoken_collector.getIdToken(manager.email).then(idtoken=>{
    chai
      .request(app)
      .post("/v2/trips")
      .send(trip_not_published)
      .set("idtoken", idtoken)
      .end((err, res) => {
        trip_not_published.id = res.body._id;
        expect(res).to.have.status(200);
        done();
      });
  });
  })


  it("Get all manager's trips ("+ manager.email +") -v2", done => {
    idtoken_collector.getIdToken(manager.email).then(idtoken=>{
    chai
      .request(app)
      .get("/v2/managed-trips")
      .set("idtoken", idtoken)
      .end((err, res) => {
        expect(res.body).to.be.an('array');
        expect(res.body.length).to.equal(2);
        expect(res).to.have.status(200);
        done();
      });
  });
  })

  //TODO
  it("Put a not published Trip -v2", done => {
    var title_test = "Changed title";
    trip_not_published.title = title_test;
    console.log(trip_not_published)
    idtoken_collector.getIdToken(manager.email).then(idtoken=>{
    chai
      .request(app)
      .put("/v2/trips/" + trip_not_published.id)
      .send(trip_not_published)
      .set("idtoken", idtoken)
      .end((err, res) => { 
        //expect(JSON.stringify(res.body.title)).to.equal(title_test);
        expect(res).to.have.status(200);
        console.log(res.body.title)
        done();
      });
  });
  })


  it("Put a published Trip -v2", done => {
    var title_test = "Changed title";

    idtoken_collector.getIdToken(manager.email).then(idtoken=>{
    chai
      .request(app)
      .put("/v2/trips/" + trip_published.id)
      .send(trip_not_published)
      .set("idtoken", idtoken)
      .end((err, res) => {
        expect(JSON.stringify(res.body.title)).not.to.equal(title_test);
        expect(res).to.have.status(405);
        done();
      });
  });
  })

  it("Delete an actor ("+ manager.email +")- v2", done => {
    idtoken_collector.getIdToken(manager.email).then(idtoken=>{
        chai
        .request(app)
        .delete("/v2/actors/" + manager.id)
        .set("idtoken", idtoken)
        .end((err, res) => {
          done();
        });
    });  
    })
});