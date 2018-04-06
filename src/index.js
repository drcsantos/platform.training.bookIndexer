var async = require('async');
var config = require('./config/default.json');
var elasticsearch = require('elasticsearch');
var AWS = require('aws-sdk');
AWS.config.region = "us-east-1";

var sqs = new AWS.SQS();
var waitingSQS = false;
var queueCounter = 0;
var client = new elasticsearch.Client(config.elasticSearch);

console.info("Started Indexer...");
setInterval(function () {
    if (!waitingSQS) { // Still busy with previous request
        if (queueCounter <= 0) {
            receiveMessages();
        } else --queueCounter; // Reduce queue counter
    }
}, 1000);

// Receive messages from queue
function receiveMessages() {
    var param = {
        QueueUrl: config.sqs.queueUrl,
        MaxNumberOfMessages: 10,
        VisibilityTimeout: 60,
        WaitTimeSeconds: 20 // Wait for messages to arrive
    };
    waitingSQS = true;
    sqs.receiveMessage(param, function (err, data) {
        if (err) {
            waitingSQS = false;
            console.error(err, err.stack); // on error occurred
        } else {
            waitingSQS = false;
            if ((typeof data.Messages !== "undefined") && (data.Messages.length !== 0)) {
                console.log("Received " + data.Messages.length + " message(s) from SQS queue."); //Successful response
                processMessages(data.Messages);
            } else {
                queueCounter = 60;
                console.log("SQS queue empty, waiting for " + queueCounter + "s.");
            }
        }
    });
}

// Process Messages from Queue
function processMessages(messages) {
    async.each(messages, function (message) {
        var change = JSON.parse(message.Body);
        applyToElasticSearch(change, function (err, response, status) {
            if (err) {
                console.error(err);
            } else {
                var params = {
                    QueueUrl: config.sqs.queueUrl,
                    ReceiptHandle: message.ReceiptHandle
                };
                sqs.deleteMessage(params, function (err, data) {
                    if (err) {
                        console.log(err, err.stack);
                    } else {
                        console.log("Deleted message RequestId: " + data.ResponseMetadata.RequestId); // Successful response
                    }
                });
            }
        });
    });
}

// Index data from message to ElasticSearch
function applyToElasticSearch(data, callback) {
    var INDEX_NAME = "mongodb";
    var TYPE_NAME = "book";

    // If Operation is Delete remove index from type
    if (data.operation === "Delete") {
        client.delete({
            index: INDEX_NAME,
            id: data.object.id,
            type: TYPE_NAME
        }, callback);
    } else {
        client.index({
            index: INDEX_NAME,
            id: data.object.id,
            type: TYPE_NAME,
            body: {
                "title": data.object.title,
                "author": data.object.author,
                "genre": data.object.genre
            }
        }, callback);
    }
}