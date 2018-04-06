var elasticsearch = require('elasticsearch');
var config = require('./config/default.json');

var client = new elasticsearch.Client(config.elasticSearch);

client.cluster.health({}, function (err, response, status) {
    console.log("ElasticSearch Client Health", response);
});