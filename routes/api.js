/*
*
*
*       Complete the API routing below
*       
*       
*/

'use strict';

var expect = require('chai').expect;
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectId;
const MONGODB_CONNECTION_STRING = process.env.DB;
//Example connection: MongoClient.connect(MONGODB_CONNECTION_STRING, function(err, db) {});

module.exports = function (app) {

  app.route('/api/books')
    .get(function (req, res){
        MongoClient.connect(MONGODB_CONNECTION_STRING, (err, db) => {
          var collection = db.collection('books');
          collection.find().toArray((err, doc) => {
            for (var i=0; i<doc.length; i++) {
              doc[i].commentcount = doc[i].comments.length;
              delete doc[i].comments;
            }
            res.json(doc);
          });
        })                  
      //response will be array of book objects
      //json res format: [{"_id": bookid, "title": book_title, "commentcount": num_of_comments },...]
    })
    
    .post(function (req, res){
      var title = req.body.title;
      if (!title) return res.send('Missing title!');
      var book = {
        title: title,
        comments: []
      };
      MongoClient.connect(MONGODB_CONNECTION_STRING, (err, db) => {
        var collection = db.collection('books');
        collection.insertOne(book, (err, doc) => {
          res.json(book);
        })
      });
      //response will contain new book object including atleast _id and title
    })
    
    .delete(function(req, res){
      MongoClient.connect(MONGODB_CONNECTION_STRING, (err, db) => {
        var collection = db.collection('books');
        collection.remove();
        res.send('complete delete successful');
      })
      //if successful response will be 'complete delete successful'
    });



  app.route('/api/books/:id')
    .get(function (req, res){
      var bookid = req.params.id;
      MongoClient.connect(MONGODB_CONNECTION_STRING, (err, db) => {
        var collection = db.collection('books');
        collection.find({_id: new ObjectId(bookid)}).toArray((err, doc) => {
          if (doc.length == 0 || err) res.send('no book exists');
          res.json(doc[0]);
        })
      });
      //json res format: {"_id": bookid, "title": book_title, "comments": [comment,comment,...]}
    })
    
    .post(function(req, res){
      var bookid = req.params.id;
      var comment = req.body.comment;
      MongoClient.connect(MONGODB_CONNECTION_STRING, (err, db) => {
        var collection = db.collection('books');
        collection.findOneAndUpdate({_id: new ObjectId(bookid)}, {$push: {comments: comment}}, {new: true}, (err, doc) => {
          res.json(doc.value);
        })                                                
      })
      //json res format same as .get
    })
    
    .delete(function(req, res){
      var bookid = req.params.id;
      MongoClient.connect(MONGODB_CONNECTION_STRING, (err, db) => {
        var collection = db.collection('books');
        collection.findAndRemove({_id: new ObjectId(bookid)}, (err, doc) => {
          res.send('delete successful');
        })
      });
      //if successful response will be 'delete successful'
    });
  
};
