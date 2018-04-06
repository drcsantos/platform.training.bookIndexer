# Book Indexer (NodeJS)

Training project demonstrating AWS SQS receive messages and ElasticSearch Indexing. This project implements a nodejs application that should be listening on a queue in AWS. When a new message appears in the queue the appplication takes this message and indexes it in ElasticSearch. Each message is generated from an operation that can be Insert, Update or Delete. According to the type of operation the application indexes or removes an indexed value in ElasticSearch.

**Example of queue message:**
```json
 {
   "object": {
     "id":"59f32438f36dd63724b52904",
     "title": "Genghis Khan and the Making of the Modern World",
     "author": "Jack Weatherford",
     "genre": "History"
   }, 
   "operation": "Insert", 
   "queue": "https://sqs.us-east-2.amazonaws.com/404669482207/book-track.fifo"
 }
```

## Set up

### AWS Credentials
The application uses your **default** credential profile by reading from the credentials file located at (~/.aws/credentials).
For more information about see [Configuration and Credential Files](http://docs.aws.amazon.com/cli/latest/userguide/cli-config-files.html)

### Application Config
Look to ./src/config/default.json.
```json
{
    "sqs": {
        "queueUrl": "https://sqs.us-east-2.amazonaws.com/404669482207/book-track.fifo"
    },
    "elasticSearch": {
        "host": "127.0.0.1:9200",
        "log": "trace"
    }
}
```
- **sqs.queueUrl:** Url to AWS SQS queue. Amazon SQS assigns each queue you create an identifier called a queue URL that includes the queue name and other Amazon SQS components. Whenever you want to perform an action on a queue, you provide its queue URL.. In your system, always store the entire queue URL exactly as Amazon SQS returns it to you when you create the queue (for example, http://sqs.us-east-2.amazonaws.com/123456789012/queue2). Don't build the queue URL from its separate components each time you need to specify the queue URL in a request because Amazon SQS can change the components that make up the queue URL.
- **elasticSearch.host:** Host to access the ElasticSearch. Normally 127.0.0.1:9200 when we are running it locally.


## Run

`$ npm start`
