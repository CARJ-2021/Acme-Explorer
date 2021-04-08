const app = require("../index");
const chai = require("chai");
const chaiHttp = require("chai-http");
const idtoken_collector = require("./idtoken_collector");

var manager = {
  name: "Manager1",
  surname: "Manager1",
  email: "manager1@yopmail.com",
  password: "12345",
  preferredLanguage: "en",
  phone: "12345",
  address: "Manager1 Address",
  role: ["MANAGER"],
  banned: false,
};

var explorer1 = {
  name: "Explorer1",
  surname: "Explorer1",
  email: "explorer1@yopmail.com",
  password: "12345",
  preferredLanguage: "en",
  phone: "12345",
  address: "Explorer1 Address",
  role: ["EXPLORER"],
  banned: false,
};

var explorer2 = {
  name: "Explorer2",
  surname: "Explorer2",
  email: "explorer2@yopmail.com",
  password: "12345",
  preferredLanguage: "en",
  phone: "12345",
  address: "Explorer1 Address",
  role: ["EXPLORER"],
  banned: false,
};

var explorer3 = {
  name: "Explorer3",
  surname: "Explorer3",
  email: "explorer2@yopmail.com",
  password: "12345",
  preferredLanguage: "en",
  phone: "12345",
  address: "Explorer1 Address",
  role: ["EXPLORER"],
  banned: false,
};

var trip_published = {
  title: "Test trip",
  description: "This is a test trip",
  requirements: ["Requirement 1", "Requirement 2"],
  startDate: "2021-06-07 17:00:00",
  endDate: "2021-07-08 17:00:00",
  published: true,
  stages: [
    {
      title: "Stage 1",
      description: "This is a test stage",
      price: 20,
    },
    {
      title: "Stage 2",
      description: "This is another test stage",
      price: 25.7,
    },
  ],
};

var application = {
  comment: "test comment",
};

const { expect } = chai;
chai.use(chaiHttp);
describe("Acme-explorer trips tests", () => {
  it("Create manager for tests", (done) => {
    chai
      .request(app)
      .post("/v1/actors")
      .send(manager)
      .end((err, res) => {
        manager.id = res.body._id;
        done();
      });
  });

  it("Create Explorer1 for tests", (done) => {
    chai
      .request(app)
      .post("/v1/actors")
      .send(explorer1)
      .end((err, res) => {
        explorer1.id = res.body._id;
        done();
      });
  });

  it("Create Explorer2 for tests", (done) => {
    chai
      .request(app)
      .post("/v1/actors")
      .send(explorer2)
      .end((err, res) => {
        explorer2.id = res.body._id;
        done();
      });
  });

  it("Create Explorer3 for tests", (done) => {
    chai
      .request(app)
      .post("/v1/actors")
      .send(explorer3)
      .end((err, res) => {
        explorer3.id = res.body._id;
        done();
      });
  });

  it("Create a published trip for tests", (done) => {
    idtoken_collector.getIdToken(manager.email).then((idtoken) => {
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
  });

  it("Apply for a trip - v2", (done) => {
    idtoken_collector.getIdToken(explorer1.email).then((idtoken) => {
      chai
        .request(app)
        .post("/v2/trips/" + trip_published.id + "/apply")
        .send(application)
        .set("idtoken", idtoken)
        .end((err, res) => {
          application = res.body;
          expect(res).to.have.status(200);
          done();
        });
    });
  });

  it("Get an application (Explorer) - v2", (done) => {
    idtoken_collector.getIdToken(explorer1.email).then((idtoken) => {
      chai
        .request(app)
        .get("/v2/applications/" + application._id)
        .set("idtoken", idtoken)
        .end((err, res) => {
          expect(res.body).to.be.deep.equal(application);
          expect(res).to.have.status(200);
          done();
        });
    });
  });

  it("Get an application  (Manager) - v2", (done) => {
    idtoken_collector.getIdToken(manager.email).then((idtoken) => {
      chai
        .request(app)
        .get("/v2/applications/" + application._id)
        .set("idtoken", idtoken)
        .end((err, res) => {
          expect(res.body).to.be.deep.equal(application);
          expect(res).to.have.status(200);
          done();
        });
    });
  });

  it("Put an application - v2", (done) => {
    var text = "Updated comment";
    application.comment = text;
    idtoken_collector.getIdToken(explorer1.email).then((idtoken) => {
      chai
        .request(app)
        .put("/v2/applications/" + application._id)
        .send(application)
        .set("idtoken", idtoken)
        .end((err, res) => {
          expect(res.body).to.be.deep.equal(application);
          expect(res).to.have.status(200);
          done();
        });
    });
  });

  it("Due an application - v2", (done) => {
    idtoken_collector.getIdToken(manager.email).then((idtoken) => {
      chai
        .request(app)
        .put("/v2/applications/due/" + application._id)
        .set("idtoken", idtoken)
        .end((err, res) => {
          console.log(res.body);
          //expect(res.body.status).to.equal("DUE");
          expect(res).to.have.status(200);
          done();
        });
    });
  });

  it("Pay an application - v2", (done) => {
    idtoken_collector.getIdToken(explorer1.email).then((idtoken) => {
      chai
        .request(app)
        .put("/v2/applications/pay/" + application._id)
        .set("idtoken", idtoken)
        .end((err, res) => {
          expect(res.body.status).to.equal("ACCEPTED");
          expect(res).to.have.status(200);
          done();
        });
    });
  });

  it("Apply for a trip - v2", (done) => {
    idtoken_collector.getIdToken(explorer2.email).then((idtoken) => {
      chai
        .request(app)
        .post("/v2/trips/" + trip_published.id + "/apply")
        .send(application)
        .set("idtoken", idtoken)
        .end((err, res) => {
          application = res.body;
          expect(res).to.have.status(200);
          done();
        });
    });
  });

  it("Reject an application - v2", (done) => {
    idtoken_collector.getIdToken(explorer1.email).then((idtoken) => {
      chai
        .request(app)
        .put("/v2/applications/reject/" + application._id)
        .set("idtoken", idtoken)
        .end((err, res) => {
          expect(res.body.status).to.equal("REJECTED");
          expect(res).to.have.status(200);
          done();
        });
    });
  });

  it("Delete an actor (" + manager.email + ")- v2", (done) => {
    idtoken_collector.getIdToken(manager.email).then((idtoken) => {
      chai
        .request(app)
        .delete("/v2/actors/" + manager.id)
        .set("idtoken", idtoken)
        .end((err, res) => {
          done();
        });
    });
  });

  it("Delete an actor (" + explorer1.email + ")- v2", (done) => {
    idtoken_collector.getIdToken(explorer1.email).then((idtoken) => {
      chai
        .request(app)
        .delete("/v2/actors/" + explorer1.id)
        .set("idtoken", idtoken)
        .end((err, res) => {
          done();
        });
    });
  });

  it("Delete an actor (" + explorer2.email + ")- v2", (done) => {
    idtoken_collector.getIdToken(explorer2.email).then((idtoken) => {
      chai
        .request(app)
        .delete("/v2/actors/" + explorer2.id)
        .set("idtoken", idtoken)
        .end((err, res) => {
          done();
        });
    });
  });

  it("Delete an actor (" + explorer3.email + ")- v2", (done) => {
    idtoken_collector.getIdToken(explorer3.email).then((idtoken) => {
      chai
        .request(app)
        .delete("/v2/actors/" + explorer3.id)
        .set("idtoken", idtoken)
        .end((err, res) => {
          done();
        });
    });
  });
});
