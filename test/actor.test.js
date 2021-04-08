const app = require("../index");
const chai = require("chai");
const chaiHttp = require("chai-http");
const idtoken_collector = require("./idtoken_collector");

var admin1 = {
    "name": "Admin1",
    "surname": "Admin1",
    "email": "admin1@yopmail.com",
    "password": "12345",
    "preferredLanguage": "en",
    "phone": "12345",
    "address": "Admin1 Address",
    "role": [
        "ADMINISTRATOR"
    ],
    "banned": false
}

var explorer = {
    "name": "Explorer1",
    "surname": "Explorer1",
    "email": "explorer1@yopmail.com",
    "password": "12345",
    "preferredLanguage": "en",
    "phone": "12345",
    "address": "Explorer1 Address",
    "role": [
        "EXPLORER"
    ],
    "banned": false
}

var sponsor = {
    "name": "Sponsor1",
    "surname": "Sponsor1",
    "email": "sponsor1@yopmail.com",
    "password": "12345",
    "preferredLanguage": "en",
    "phone": "12345",
    "address": "Sponsor1 Address",
    "role": [
        "SPONSOR"
    ],
    "banned": false
} 

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

const { expect } = chai;
chai.use(chaiHttp);
describe("Acme-explorer actor tests", () => {
  it("Create the first admin", done => {
    chai
      .request(app)
      .post("/v1/actors")
      .send(admin1)
      .end((err, res) => {
        admin1.id = res.body._id;
        expect(res).to.have.status(200);
        done();
      });
  });

  it("Register an explorer -v2", done => {
    chai
      .request(app)
      .post("/v2/actors")
      .send(explorer)
      .end((err, res) => {
        explorer.id = res.body._id;
        expect(res).to.have.status(200);
        done();
      });
  });

  it("Register an sponsor - v2", done => {
    idtoken_collector.getIdToken(admin1.email).then(idtoken=>{
        chai
        .request(app)
        .post("/v2/actors")
        .set("idtoken", idtoken)
        .send(sponsor)
        .end((err, res) => {
          sponsor.id = res.body._id;
          expect(res).to.have.status(200);
          done();
        });
    });  
    })

    it("Register an manager - v2", done => {
    idtoken_collector.getIdToken(admin1.email).then(idtoken=>{
        chai
        .request(app)
        .post("/v2/actors")
        .set("idtoken", idtoken)
        .send(manager)
        .end((err, res) => {
          manager.id = res.body._id;
          expect(res).to.have.status(200);
          done();
        });
    });  
    })

    it("Get an actor - v2", done => {
        chai
        .request(app)
        .get("/v2/actors/"+manager.id)
        .end((err, res) => {
          expect(res).to.have.status(200);
          done();
        });
    })

    it("Update an actor ("+ sponsor.email +")- v2", done => {

    var new_name = "test"
    var new_surname = "Test suername"

    sponsor.name = new_name
    sponsor.surname = new_surname
    idtoken_collector.getIdToken(sponsor.email).then(idtoken=>{
        chai
        .request(app)
        .put("/v2/actors/" + sponsor.id)
        .send(sponsor)
        .set("idtoken", idtoken)
        .end((err, res) => {
          expect(res.body.name).to.equal(new_name);
          expect(res.body.surname).to.equal(new_surname);
          expect(res).to.have.status(200);
          done();
        });
    });  
    })


    it("Ban an actor ("+ sponsor.email +")- v2", done => {
    idtoken_collector.getIdToken(admin1.email).then(idtoken=>{
        chai
        .request(app)
        .put("/v2/actors/ban/" + sponsor.id)
        .set("idtoken", idtoken)
        .end((err, res) => {
          expect(res).to.have.status(200);
          done();
        });
    });  
    })

    it("Unban an actor ("+ sponsor.email +")- v2", done => {
    idtoken_collector.getIdToken(admin1.email).then(idtoken=>{
        chai
        .request(app)
        .put("/v2/actors/unban/" + sponsor.id)
        .set("idtoken", idtoken)
        .end((err, res) => {
          expect(res).to.have.status(200);
          done();
        });
    });  
    })

    it("Delete an actor ("+ sponsor.email +")- v2", done => {
    idtoken_collector.getIdToken(sponsor.email).then(idtoken=>{
        chai
        .request(app)
        .delete("/v2/actors/" + sponsor.id)
        .set("idtoken", idtoken)
        .end((err, res) => {
          expect(res).to.have.status(200);
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
          expect(res).to.have.status(200);
          done();
        });
    });  
    })

    it("Delete an actor ("+ explorer.email +")- v2", done => {
    idtoken_collector.getIdToken(explorer.email).then(idtoken=>{
        chai
        .request(app)
        .delete("/v2/actors/" + explorer.id)
        .set("idtoken", idtoken)
        .end((err, res) => {
          expect(res).to.have.status(200);
          done();
        });
    });  
    })

    
    it("Delete an actor ("+ admin1.email +")- v2", done => {
    idtoken_collector.getIdToken(admin1.email).then(idtoken=>{
        chai
        .request(app)
        .delete("/v2/actors/" + admin1.id)
        .set("idtoken", idtoken)
        .end((err, res) => {
          expect(res).to.have.status(200);
          done();
        });
    });  
    })

});
