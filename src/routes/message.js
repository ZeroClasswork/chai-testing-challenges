const express = require("express");
const router = express.Router();

const User = require("../models/user");
const Message = require("../models/message");

/** Route to get all messages. */
router.get("/", (req, res) => {
  Message.find({})
    .then(messages => {
      return res.json(messages)
    })
    .catch(err => {
      return res.status(404)
    })
});

/** Route to get one message by id. */
router.get("/:messageId", (req, res) => {
  Message.findOne({ _id: req.params.messageId })
    .then(message => {
      return res.json(message)
    })
    .catch(err => {
      return res.sendStatus(404)
    })
});

/** Route to add a new message. */
router.post("/", (req, res) => {
  let message = new Message(req.body);
  message
    .save()
    .then((message) => {
      return User.findById(message.author);
    })
    .then((user) => {
      // console.log(user)
      user.messages.unshift(message);
      return user.save();
    })
    .then(() => {
      return res.send(message);
    })
    .catch((err) => {
      throw err.message;
    });
});

/** Route to update an existing message. */
router.put("/:messageId", (req, res) => {
  Message.findByIdAndUpdate(req.params.messageId)
    .then(message => {
      message = req.body
      return res.json(message)
    })
    .catch(err => {
      return res.sendStatus(404)
    })
});

/** Route to delete a message. */
router.delete("/:messageId", (req, res) => {
  Message.findByIdAndDelete(req.params.messageId)
    .then(message => {
      return User.findByIdAndDelete(messageId)
    })
    .then(message => {
      return res.json("Message deleted")
    })
    .catch(err => {
      return res.sendStatus(404)
    })
});

module.exports = router;
