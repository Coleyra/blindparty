var socket = io();
var audio = document.getElementById("questionAudio");
var userSound = document.getElementById("answerUserSound");
var alreadyAnswered = false;
var questionType = '';

function compare(a,b) {
	if (a.score < b.score)
		return -1;
	if (a.score > b.score)
		return 1;
	return 0;
}

function reset() {
	$('#bAnswer').prop('disabled', true);
}

function startTimer(duration, display) {
	var timer = duration, seconds;
	var refreshIntervalId = setInterval(function () {
		seconds = parseInt(timer % 60, 10);

		seconds = seconds < 10 ? "0" + seconds : seconds;

		display.text(seconds + 's');

		if (--timer < 0) {
			$('#bShowAnswer').show();
			$('#time').hide();
			clearInterval(refreshIntervalId);
		}
	}, 1000);
}

function generateUser(user) {
	return '<div class="user clearfix" style="width: 208px; margin: 5px; border: 1px solid lightblue; border-radius: 8px; padding: 3px;"><div class="userIdentity float-left" style="width: 32px;"><img src="image/user/' + user.identity + '.jpg" width="32" height="32" /></div><div class="userName float-left text-center" style="width: 100px; height: 32px; padding-top: 8px;">' + user.name + '</div><div class="userScore float-left text-right" style="width: 68px; height: 32px; padding-top: 8px;">' + user.score + ' pts</div></div><div>';
}

function pause() {
	audio.pause();
	player.pauseVideo();
}

//SEND
$('#bAnswer').on("click", function() {
	socket.emit('answer');
	$('#bAnswer').prop('disabled', true);
});
$('#bAdmin').on("click", function() {
	socket.emit('admin');
	$('#bAdmin').prop('disabled', true);
	$('#client').hide();
	$('#admin').show();
});
$('#bStart').on("click", function() {
	socket.emit('start');
	$('#bStart').hide;
	$('#bNext').show();
});
$('#bUserWrong').on("click", function() {
	socket.emit('wrong');
	$('#answerUserName').html('');
	$('#clientAnswer').hide();
	$('#bUserWrong').hide();
	$('#bUserTrue').hide();
});
$('#bUserTrue').on("click", function() {
	socket.emit('true');
	$('#answerUserName').html('');
	$('#clientAnswer').hide();
	$('#bUserWrong').hide();
	$('#bUserTrue').hide();
});
$('#bReset').on("click", function() {
	socket.emit('reset');
});
$('#bSaveParameters').on("click", function() {
	parameters = {
		userName : $('#userName').val(),
		userSound : $('#userSound').val()
	};
	$('#userInfos').html('<img src="image/user/' + $('#userSound').val() + '.jpg" width="32" height="32" /> ' + $('#userName').val());
	socket.emit('saveParameters', parameters);
});
$('#bShowAnswer').on("click", function(){
   socket.emit('showAnswer');
   $('#bShowAnswer').hide();
   $('#bUserWrong').show();
   $('#bUserTrue').show();
});
$('#bNext').on("click", function(){
	socket.emit('next');
	$('#adminAnswer').html('');
});

//RECEIPT
socket.on('answer', function(msg){
	console.log('answer');
	console.log(msg);
	$('#bAnswer').prop('disabled', true);
});
socket.on('userAnswer', function(msg){
	console.log('UserAnswer');
	pause();
	$('#answerUserName').html('<img src="image/user/' + msg.identity + '.jpg" width="64" height="64" /> ' + msg.name);
	$('#answerUserSoundSource').attr('src', 'sound/user/' + msg.identity + '.mp3');
	console.log(userSound);
	userSound.load();
	userSound.play();
});
socket.on('faster', function() {
	startTimer(3, $('#time'));
	$('#time').show();
	alreadyAnswered = true; 
});
socket.on('admin', function(){
	$('#bAdmin').attr('disabled', 'disabled');
});
//L'admin reçoit une question
socket.on('question', function(msg){
	pause();
	console.log('question');
	console.info(msg);
	$('#bAnswer').prop('disabled', false);
	questionType = msg.type;
	if(questionType === 'music') {
		$('#questionImage').hide();
		$('#questionAudioSource').attr('src', 'sound/quizz/' + msg.id + '.mp3');
		audio.load();
		audio.play();
	} else if(questionType === 'youtube') {
		$('#questionImage').hide();
		player.loadVideoById(msg.src, 0, "large");
		player.playVideo();
	} else if (questionType === 'image') {
		pause();
		$('#questionImageSource').attr('src', 'image/quizz/' + msg.id + '.jpg');
		$('#questionImage').show();
	}
	$('#answerUserName').html('');
	$('#adminQuestion').html(msg.label);
});
socket.on('newQuestion', function(msg){
	console.log('newQuestion');
	$('#userQuestion').html(msg);
	$('#bAnswer').prop('disabled', false);
	$('#bShowAnswer').hide();
	alreadyAnswered = false;
});
socket.on('wrong', function(){
	console.log('Wrong');
	if(!alreadyAnswered) {
		$('#bAnswer').prop('disabled', false);
	}
});
socket.on('continue', function(){
	console.log('Continue');
	$('#answerUserName').html('');
	if(questionType === 'music') {
		audio.play();
	} else if (questionType === 'youtube') {
		player.playVideo();
	}
});
socket.on('reset', function(){
	console.log('Reset');
	reset();
});
socket.on('userName', function(msg){
	$('#userName').val(msg);
	$('#modalParameters').modal('show');
});
socket.on('showAnswer', function(msg){
	console.log('showAnswer');
	$('#clientAnswer').show();
	$('#clientAnswer').html(msg);
	$('#adminAnswer').html('La réponse était : ' + msg);
});
socket.on('users', function(msg) {
	console.log('Users');
	$('#users ol').html('');
	$('#modalScores .modal-body ol').html('');
	var len = msg.length;
	msg.sort(compare);

	while (len--) {
		console.log(msg[len].admin);
		if(msg[len].admin === '') {
			$('#users ol').append('<li>' + generateUser(msg[len]) + '</li>');
			$('#modalScores .modal-body ol').append('<li>' + generateUser(msg[len]) + '</li>');
		}
	}
});
socket.on('noAdmin', function(msg){
	console.log('NoAdmin');
	$('#bAdmin').hide();
});

socket.on('redirect', function(destination) {
	window.location.href = destination;
});
