const app = require("../index");
const chai = require("chai");
const chaiHttp = require("chai-http");
const idtoken_collector = require("./idtoken_collector");
const { expect } = chai;

var admin1 = {
    name: "Admin1",
    surname: "Admin1",
    email: "admin1@yopmail.com",
    password: "12345",
    preferredLanguage: "en",
    phone: "12345",
    address: "Admin1 Address",
    role: ["ADMINISTRATOR"],
    banned: false,
};

var sponsor1 = {
    name: "Sponsor1",
    surname: "Sponsor1",
    email: "sponsor1@yopmail.com",
    password: "12345",
    preferredLanguage: "en",
    phone: "12345",
    address: "Sponsor1 Address",
    role: ["SPONSOR"],
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

var updatedConfiguration = {
    id: "mainConfig",
    finderTime: 25,
    findResult: 10,
    sponsorshipFlatRate: 15
};

chai.use(chaiHttp);
describe("Acme-Explorer configuration tests", () => {
    it("Create an admin for tests", (done) => {
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

    it("Create Sponsor1 for tests", (done) => {
        chai
            .request(app)
            .post("/v1/actors")
            .send(sponsor1)
            .end((err, res) => {
                sponsor1.id = res.body._id;
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

    it("Get configuration as an admin - v2", (done) => {
        idtoken_collector.getIdToken(admin1.email).then((idtoken) => {
            chai
                .request(app)
                .get("/v2/configuration")
                .set("idtoken", idtoken)
                .end((err, res) => {
                    expect(res.body).to.be.an("array");
                    expect(res.body.length).to.equal(1);
                    expect(res).to.have.status(200);
                    done();
                });
        });
    });

    it("Cannot get configuration as a sponsor - v2", (done) => {
        idtoken_collector.getIdToken(sponsor1.email).then((idtoken) => {
            chai
                .request(app)
                .get("/v2/configuration")
                .set("idtoken", idtoken)
                .end((err, res) => {
                    expect(res).to.have.status(403);
                    done();
                });
        });
    });

    it("Cannot get configuration as an explorer - v2", (done) => {
        idtoken_collector.getIdToken(explorer1.email).then((idtoken) => {
            chai
                .request(app)
                .get("/v2/configuration")
                .set("idtoken", idtoken)
                .end((err, res) => {
                    expect(res).to.have.status(403);
                    done();
                });
        });
    });

    it("Cannot get configuration as a manager - v2", (done) => {
        idtoken_collector.getIdToken(manager.email).then((idtoken) => {
            chai
                .request(app)
                .get("/v2/configuration")
                .set("idtoken", idtoken)
                .end((err, res) => {
                    expect(res).to.have.status(403);
                    done();
                });
        });
    });

    it("Update configuration as an admin - v2", (done) => {
        idtoken_collector.getIdToken(admin1.email).then((idtoken) => {
            chai
                .request(app)
                .put("/v2/configuration")
                .set("idtoken", idtoken)
                .send(updatedConfiguration)
                .end((err, res) => {
                    expect(res.body.finderTime).to.be.equal(updatedConfiguration.finderTime);
                    expect(res.body.findResult).to.be.equal(updatedConfiguration.findResult);
                    expect(res.body.sponsorshipFlatRate).to.be.equal(updatedConfiguration.sponsorshipFlatRate);
                    expect(res).to.have.status(200);
                    done();
                });
        });
    });

    it("Cannot update configuration as a sponsor - v2", (done) => {
        idtoken_collector.getIdToken(sponsor1.email).then((idtoken) => {
            chai
                .request(app)
                .put("/v2/configuration")
                .set("idtoken", idtoken)
                .send(updatedConfiguration)
                .end((err, res) => {
                    expect(res).to.have.status(403);
                    done();
                });
        });
    });

    it("Cannot update configuration as an explorer - v2", (done) => {
        idtoken_collector.getIdToken(explorer1.email).then((idtoken) => {
            chai
                .request(app)
                .put("/v2/configuration")
                .set("idtoken", idtoken)
                .send(updatedConfiguration)
                .end((err, res) => {
                    expect(res).to.have.status(403);
                    done();
                });
        });
    });

    it("Cannot update configuration as a manager - v2", (done) => {
        idtoken_collector.getIdToken(manager.email).then((idtoken) => {
            chai
                .request(app)
                .put("/v2/configuration")
                .set("idtoken", idtoken)
                .send(updatedConfiguration)
                .end((err, res) => {
                    expect(res).to.have.status(403);
                    done();
                });
        });
    });

    it("Delete an actor (" + admin1.email + ") - v2", (done) => {
        idtoken_collector.getIdToken(admin1.email).then((idtoken) => {
            chai
                .request(app)
                .delete("/v2/actors/" + admin1.id)
                .set("idtoken", idtoken)
                .end((err, res) => {
                    expect(res).to.have.status(200);
                    done();
                });
        });
    });

    it("Delete an actor (" + sponsor1.email + ") - v2", (done) => {
        idtoken_collector.getIdToken(sponsor1.email).then((idtoken) => {
            chai
                .request(app)
                .delete("/v2/actors/" + sponsor1.id)
                .set("idtoken", idtoken)
                .end((err, res) => {
                    expect(res).to.have.status(200);
                    done();
                });
        });
    });

    it("Delete an actor (" + explorer1.email + ") - v2", (done) => {
        idtoken_collector.getIdToken(explorer1.email).then((idtoken) => {
            chai
                .request(app)
                .delete("/v2/actors/" + explorer1.id)
                .set("idtoken", idtoken)
                .end((err, res) => {
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
});