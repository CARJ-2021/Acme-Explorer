const app = require("../index");
const chai = require("chai");
const chaiHttp = require("chai-http");
const idtoken_collector = require("./idtoken_collector");
const { expect } = chai;

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

var sponsor2 = {
    name: "Sponsor2",
    surname: "Sponsor2",
    email: "sponsor2@yopmail.com",
    password: "12345",
    preferredLanguage: "en",
    phone: "12345",
    address: "Sponsor2 Address",
    role: ["SPONSOR"],
    banned: false,
};

var sponsorship1 = {
    banner: "http://banner1.com",
    link: "http://bannerlink1.com"
};

var sponsorship2 = {
    banner: "http://banner2.com",
    link: "http://bannerlink2.com"
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

chai.use(chaiHttp);
describe("Acme-Explorer sponsorship tests", () => {
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

    it("Create Sponsor1 for tests", (done) => {
        chai
            .request(app)
            .post("/v1/actors")
            .send(sponsor2)
            .end((err, res) => {
                sponsor2.id = res.body._id;
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

    it("Create sponsorship 1", (done) => {
        idtoken_collector.getIdToken(sponsor1.email).then((idtoken) => {
            chai
                .request(app)
                .post("/v2/sponsorships")
                .send(sponsorship1)
                .set("idtoken", idtoken)
                .end((err, res) => {
                    sponsorship1 = res.body;
                    expect(res).to.have.status(200);
                    done();
                });
        });
    });

    it("Create sponsorship 2", (done) => {
        idtoken_collector.getIdToken(sponsor1.email).then((idtoken) => {
            chai
                .request(app)
                .post("/v2/sponsorships")
                .send(sponsorship2)
                .set("idtoken", idtoken)
                .end((err, res) => {
                    sponsorship2 = res.body;
                    expect(res).to.have.status(200);
                    done();
                });
        });
    });

    it("Get all sponsorships of a sponsor - v2", (done) => {
        idtoken_collector.getIdToken(sponsor1.email).then((idtoken) => {
            chai
                .request(app)
                .get("/v2/sponsorships")
                .set("idtoken", idtoken)
                .end((err, res) => {
                    expect(res.body).to.be.an("array");
                    expect(res.body.length).to.equal(2);
                    expect(res).to.have.status(200);
                    done();
                });
        });
    });

    it("Get a single sponsorships of a sponsor - v2", (done) => {
        idtoken_collector.getIdToken(sponsor1.email).then((idtoken) => {
            chai
                .request(app)
                .get("/v2/sponsorships/" + sponsorship1._id)
                .set("idtoken", idtoken)
                .end((err, res) => {
                    expect(res.body).to.be.deep.equal(sponsorship1);
                    expect(res).to.have.status(200);
                    done();
                });
        });
    });

    it("Update a sponsorship - v2", (done) => {
        var updatedBanner = "http://updated-banner1.com";
        sponsorship1.banner = updatedBanner;
        idtoken_collector.getIdToken(sponsor1.email).then((idtoken) => {
            chai
                .request(app)
                .put("/v2/sponsorships/" + sponsorship1._id)
                .send(sponsorship1)
                .set("idtoken", idtoken)
                .end((err, res) => {
                    expect(res.body).to.be.deep.equal(sponsorship1);
                    expect(res).to.have.status(200);
                    done();
                });
        });
    });

    it("Delete a sponsorship - v2", (done) => {
        idtoken_collector.getIdToken(sponsor1.email).then((idtoken) => {
            chai
                .request(app)
                .delete("/v2/sponsorships/" + sponsorship1._id)
                .set("idtoken", idtoken)
                .end((err, res) => {
                    expect(res).to.have.status(200);
                    done();
                });
        });
    });

    it("Not allowed to get a sponsorship of another sponsor - v2", (done) => {
        idtoken_collector.getIdToken(sponsor2.email).then((idtoken) => {
            chai
                .request(app)
                .get("/v2/sponsorships/" + sponsorship2._id)
                .set("idtoken", idtoken)
                .end((err, res) => {
                    expect(res).to.have.status(403);
                    done();
                });
        });
    });

    it("Not allowed to update a sponsorship of another sponsor - v2", (done) => {
        var updatedBanner = "http://updated-banner1.com";
        sponsorship1.banner = updatedBanner;
        idtoken_collector.getIdToken(sponsor2.email).then((idtoken) => {
            chai
                .request(app)
                .put("/v2/sponsorships/" + sponsorship2._id)
                .send(sponsorship2)
                .set("idtoken", idtoken)
                .end((err, res) => {
                    expect(res).to.have.status(401);
                    done();
                });
        });
    });

    it("Not allowed to delete a sponsorship of another sponsor - v2", (done) => {
        idtoken_collector.getIdToken(sponsor2.email).then((idtoken) => {
            chai
                .request(app)
                .delete("/v2/sponsorships/" + sponsorship2._id)
                .set("idtoken", idtoken)
                .end((err, res) => {
                    expect(res).to.have.status(401);
                    done();
                });
        });
    });

    it("Pay a sponsorship - v2", (done) => {
        idtoken_collector.getIdToken(sponsor1.email).then((idtoken) => {
            chai
                .request(app)
                .put("/v2/sponsorships/" + sponsorship2._id + "/pay/" + trip_published.id)
                .set("idtoken", idtoken)
                .end((err, res) => {
                    expect(res.body.paid).to.equal(true);
                    expect(res).to.have.status(200);
                    done();
                });
        });
    });

    it("Cannot pay the same sponsorship twice on one trip - v2", (done) => {
        idtoken_collector.getIdToken(sponsor1.email).then((idtoken) => {
            chai
                .request(app)
                .put("/v2/sponsorships/" + sponsorship2._id + "/pay/" + trip_published.id)
                .set("idtoken", idtoken)
                .end((err, res) => {
                    expect(res).to.have.status(409);
                    done();
                });
        });
    });

    it("Cannot pay a sponsorship of another sponsor - v2", (done) => {
        idtoken_collector.getIdToken(sponsor2.email).then((idtoken) => {
            chai
                .request(app)
                .put("/v2/sponsorships/" + sponsorship2._id + "/pay/" + trip_published.id)
                .set("idtoken", idtoken)
                .end((err, res) => {
                    expect(res).to.have.status(403);
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
                    done();
                });
        });
    });

    it("Delete an actor (" + sponsor2.email + ") - v2", (done) => {
        idtoken_collector.getIdToken(sponsor2.email).then((idtoken) => {
            chai
                .request(app)
                .delete("/v2/actors/" + sponsor2.id)
                .set("idtoken", idtoken)
                .end((err, res) => {
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