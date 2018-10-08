var express = require('express');
var app = express();
var path = require('path');
var http = require('http').Server(app);
var io = require('socket.io')(http);
var mysql = require('mysql');
var config = require('./config');

var dbConnection = mysql.createConnection(config.db);
var users = [];
var questions = [99999999];
var userNumber = 1;
var answering = 0;
var admin = '';
var question = [
{
	'id': 0,
	'label': '',
	'answer': '',
	'type': 'music'
}]

app.use(express.static('public'));

dbConnection.connect(function(err) {
  console.log(err);
});

app.get('/', function(req, res){
    res.sendFile('index.html', { root: path.join(__dirname, '/') });
});

function findIndex(arr, id) {
    var len = arr.length;

    while (len--) {
        if (arr[len].id === id) {
            return len;
        }
    }

    return -1;
};


function nextQuestion() {
    console.log('NextQuestion');
    answering = 0;
    console.log(questions);
    //var post  = {id: 1};
    var query = dbConnection.query("SELECT id, label, answer, type, src FROM question WHERE id NOT IN (?) AND diffusion = 0 ORDER BY RAND() LIMIT 1", [questions], function(err, result) {
        console.log(query.sql);
        //dbConnection.release();
        if(!err) {
            console.log(result);
            question.id = result[0].id;
            question.label = result[0].label;
            question.answer = result[0].answer;
            question.type = result[0].type;
			question.src = result[0].src;
            questions.push(result[0].id);

            console.log(admin);
            io.to(admin).emit('question', result[0]);
            io.emit('newQuestion', question.label);
        } else {
            console.log(err);
        }
    });
}

function sendUsers() {
    io.emit('users', users);
}

function reset() {
	//Remise des users à 0
	users = [];
	userNumber = 1;
	answering = 0;
	admin = '';
    questions = [99999999];
}

io.on('connection', function(socket){
	var myNumber = userNumber++;
	var myName = 'user' + myNumber;
	var currentUser = {score: 0, name: myName, number: myNumber, id: socket.id, admin: '', identity: 1};
	users.push(currentUser);

	//Send back his username
	io.to(currentUser.id).emit('userName', currentUser.name);
    if(admin !== '') io.to(currentUser.id).emit('noAdmin', admin);
    sendUsers();

	socket.on('answer', function(msg) {
		console.log('Answer (by ' + users[findIndex(users, currentUser.id)].name + ')');
		console.log(answering);
        if(answering === 0) {
            answering = findIndex(users, currentUser.id);
            io.emit('answer', users[answering]);
            io.to(currentUser.id).emit('faster');
            io.to(admin).emit('userAnswer', users[answering]);
        }
	});
	socket.on('start', function(msg) {
		console.log('Start (by ' + users[findIndex(users, currentUser.id)].name + ')');
		io.emit('start', msg);
		nextQuestion();
	});
	socket.on('next', function(msg) {
		console.log('Next (by ' + users[findIndex(users, currentUser.id)].name + ')');
		nextQuestion();
	});
	socket.on('wrong', function(msg) {
		console.log('Wrong (by ' + users[findIndex(users, currentUser.id)].name + ')');
		io.emit('wrong');
        answering = 0;
		io.to(admin).emit('continue');
		//users[answering].score -= 1;
		//nextQuestion();
	});
	socket.on('true', function(msg) {
		console.log('True (by ' + users[findIndex(users, currentUser.id)].name + ')');
		users[answering].score += 1;
        io.to(admin).emit('showAnswer', question.answer);
        sendUsers();
	});
	socket.on('admin', function() {
		console.log('Admin (by ' + users[findIndex(users, currentUser.id)].name + ')');
		admin = socket.id;
		users[findIndex(users, socket.id)].admin = 1;
		io.emit('admin', admin);
	});
	socket.on('reset', function() {
		console.log('Reset (by ' + users[findIndex(users, currentUser.id)].name + ')');
		reset();
		io.emit('reset');
	});
	socket.on('saveParameters', function(parameters) {
		console.log('SaveParameters (by ' + users[findIndex(users, currentUser.id)].name + ')');
		currentUser.name = parameters.userName;
		currentUser.identity = parameters.userIdentity;
        sendUsers();
	});
    socket.on('showAnswer', function() {
        console.log(currentUser.id);
        console.log(question.answer);
        console.log('ShowAnswer (by ' + users[findIndex(users, currentUser.id)].name + ')');
        io.to(currentUser.id).emit('showAnswer', question.answer);
    });

    socket.on('disconnect', function() {
        var index = findIndex(users, currentUser.id);
		console.log('Disconnect');
        if(index >= 0) users.splice(findIndex(users, currentUser.id), 1);
    });
});

http.listen(config.port, function(){
	console.log('listening on *:' + config.port);
});