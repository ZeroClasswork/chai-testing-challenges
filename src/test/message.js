require("dotenv").config();
const app = require("../server.js");
const mongoose = require("mongoose");
const chai = require("chai");
const chaiHttp = require("chai-http");
const assert = chai.assert;

const User = require("../models/user.js");
const Message = require("../models/message.js");
const { json } = require("express");
const { findByIdAndDelete } = require("../models/user.js");
const { readyState } = require("../config/db-setup.js");

chai.config.includeStack = true;

const expect = chai.expect;
const should = chai.should();
chai.use(chaiHttp);

/**
 * root level hooks
 */
after((done) => {
  // required because https://github.com/Automattic/mongoose/issues/1251#issuecomment-65793092
  mongoose.models = {};
  mongoose.modelSchemas = {};
  mongoose.connection.close();
  done();
});

describe("Message API endpoints", () => {
  users = []
  messages = []

  before((done) => {
    user1 = new User({username: "user1", password: "passone"})
    user2 = new User({username: "user2", password: "passtwo"})
    message1 = new Message({
      title: "Hi I'm user 1",
      body: "User 1 stuff here",
      author: user1
    })
    message2 = new Message({
      title: "Hi I'm user 2",
      body: "User 2 stuff here",
      author: user2
    })
    message3 = new Message({
      title: "Hi I'm user 1",
      body: "More user 1 stuff here",
      author: user1
    })
    message4 = new Message({
      title: "Hi I'm user 2",
      body: "More user 2 stuff here",
      author: user2
    })
    users.push(user1)
    users.push(user2)
    messages.push(message1)
    messages.push(message2)
    messages.push(message3)
    messages.push(message4)

    users.forEach(user => {
      user.save()
    })
    messages.forEach(message => {
      message.save()
    })

    done()
  })

  after((done) => {
    users.forEach(user => {
      User.findByIdAndDelete(user.id)
    })
    messages.forEach(message => {
      Message.findByIdAndDelete(message.id)
    })

    done()
  })

  it("should load all messages", (done) => {
    chai
      .request(app)
      .get("/messages")
      .end(function(err, res) {
        if (err) {
          return done(err)
        }
        res.status.should.equal(200)
        res.body.should.be.a("array")
        res.body.should.have.lengthOf.above(3)
        return done()
      })
  });

  it("should get one specific message", (done) => {
    chai
      .request(app)
      .get("/messages/" + message1.id)
      .end(function(err, res) {
        if (err) {
          return done(err)
        }
        res.status.should.equal(200)
        res.body.should.be.a("Object")
        res.body.should.have.property("title").and.to.equal(message1.title)
        res.body.should.have.property("body").and.to.equal(message1.body)
        res.body.should.have.property("author").and.be.equal(message1.author.id)
        done()
      })
  });

  it("should post a new message", (done) => {
    var newPost = {
      title: "Hello from post test",
      body: "Hi I'm a post test message",
      author: user1.id
    }
    chai
      .request(app)
      .post("/messages")
      .type("form")
      .send(newPost)
      .end(function(err, res) {
        if (err) {
          return done(err)
        }
        Message.findById(res.body.id)
          .catch(err => {
            return done(err)
          })
        res.status.should.equal(200)
        res.body.should.be.a("Object")
        res.body.should.have.property("title").and.to.equal(newPost.title)
        res.body.should.have.property("body").and.to.equal(newPost.body)
        res.body.should.have.property("author").and.be.equal(newPost.author)
        done()
      })
  });

  it("should update a message", (done) => {
    chai
      .request(app)
      .put("/messages/" + messages[0].id)
      .type("form")
      .send({
        title: "Altered title",
        body: messages[0].body,
        author: messages[0].author.id
      })
      .end(function(err, res) {
        if (err) {
          return done(err)
        }
        Message.findById(res.body.id)
          .catch(err => {
            return done(err)
          })
        res.status.should.equal(200)
        res.body.should.be.a("Object")
        res.body.should.have.property("title").and.to.equal("Altered title")
        res.body.should.have.property("body").and.to.equal(messages[0].body)
        res.body.should.have.property("author").and.be.equal(messages[0].author.id)
        done()
      })
  });

  it("should delete a message", (done) => {
    var id = messages[1].id
    chai
      .request(app)
      .delete("/messages/" + id)
      .end(function(err, res) {
        Message.findById(id)
          .then(message => {
            throw err
          })
          .catch(err => {
            return done()
          })
      })
  })
})
