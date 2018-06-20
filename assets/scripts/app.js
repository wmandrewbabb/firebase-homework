$(document).ready(function() {

// Initialize Firebase
	var config = {
		apiKey: "AIzaSyCFD8olAobC0-gg2X_THhU7JS7GBWJvbtI",
		authDomain: "rockpaperscissorshw7.firebaseapp.com",
		databaseURL: "https://rockpaperscissorshw7.firebaseio.com",
		projectId: "rockpaperscissorshw7",
		storageBucket: "rockpaperscissorshw7.appspot.com",
		messagingSenderId: "711132619692"
	};

	firebase.initializeApp(config);

	//Firebase reference vars
	var ref = firebase.database().ref();
	var playersRef = firebase.database().ref("players");
	var player1Ref = firebase.database().ref("players/1");
	var player2Ref = firebase.database().ref("players/2");
	var chat = firebase.database().ref("chat");
	var connectedRef = firebase.database().ref(".info/connected");
	var connectionsRef = firebase.database().ref("connections");
	var firstConnect = true; // variable for display error handling
	var connectionsAtOnce = 0; // another variable for display error handling
	var playerName;
	var playerNum; 
	var playersConnected;
	var userKey; 
	var gameNumber = 1;
	var pauseInterval = 2000;


	var displayoption = function(pNum) {

		if(playerNum === pNum) {

			$("#player" + pNum + "option").empty();

			var r = $("<div>").text("Rock").attr("dataOption", "Rock").addClass("player" + pNum + "option");
			var p = $("<div>").text("Paper").attr("dataOption", "Paper").addClass("player" + pNum + "option");
			var s = $("<div>").text("Scissors").attr("dataOption", "Scissors").addClass("player" + pNum + "option");
			var rps = $("<div>").append(r, p, s);

			$("#player" + pNum + "option").append(rps);

		}
	}

	//listener for when a player takes a seat
	$("#nameSubmit").click(function(e) {

		e.preventDefault();

		playerName = $("#playerNameCatch").val().trim();
		$("#playerNameCatch").val("");

		playersRef.once("value", function(snapshot) {

			if(snapshot.exists() === false) {

				playerNum = 1;
				player1Ref.update({
					name: playerName,
					wins: 0,
					key: userKey
				});

				connectionsRef.child(userKey).set(playerName);

			} else if(snapshot.child(2).exists() === true && snapshot.child(1).exists() === false) {

				playerNum = 1;
				player1Ref.update({
					name: playerName,
					wins: 0,
					key: userKey
				});

				connectionsRef.child(userKey).set(playerName);

			} else {

				playerNum = 2;
				player2Ref.update({
					name: playerName,
					wins: 0,
					key: userKey
				});

				ref.update({
					gameNumber: 1
				});

				connectionsRef.child(userKey).set(playerName);

			}
		}).then(function() {

			$("#playerInputName").text(playerName);
			$("#playerGivenNumber").text(playerNum);
			$("#playerGreetingPanel").css("display","block");
			$("#enterGamePanel").css("display","none");

			displayoption(1);
			displayoption(2);
			console.log("DO1");

			var message = " has taken a seat.";
			var time = new Date().toLocaleString("en-US", {hour: "numeric", minute: "numeric", second: "numeric"});

			chat.push({
				name: playerName,
				message: message,
				time: time,
				playerNumber: playerNum
			});
		});
	});

	player1Ref.child("name").on("value", function(snapshot) {

		if(snapshot.exists() === true) {

			$("#player1Name").text(snapshot.val());
			$("#player1Name").addClass("player1NameEntered");
			$("#player1Name").removeClass("playerNotSeated");
			displayoption(2);
			console.log("DO4");
		}

	});

	player2Ref.child("name").on("value", function(snapshot) {

		if(snapshot.exists() === true) {

			$("#player2Name").text(snapshot.val());
			$("#player2Name").addClass("player2NameEntered");
			$("#player2Name").removeClass("playerNotSeated");
			displayoption(1);
			console.log("DO5");
		}
	});

	player1Ref.child("wins").on("value", function(snapshot) {

		if(snapshot.exists() === true) {

			$("#player1wins").text(snapshot.val());

		}
	});


	player2Ref.child("wins").on("value", function(snapshot) {

		if(snapshot.exists() === true) {

			$("#player2wins").text(snapshot.val());

		}
	});


	//hide new player input for third wheels, don't worry we'll make it visible again if someone who's seated leaves
	playersRef.on("value", function(snapshot) {

		if(snapshot.child(1).exists() === true && snapshot.child(2).exists() === true) {
			
			if(!playerNum) {

				$("#enterGamePanel").css("display","none");
				$("#tooManyPlayers").css("display","block");
			}
		}
	});

	//listeners for selecting handsign
	$(document).on("click", ".player1option", function() {

		var player1option = $(this).attr("dataOption");
		player1Ref.update({
			option: player1option
		});

		$("#player1option").text(player1option);

	});

	$(document).on("click", ".player2option", function() {

		var player2option = $(this).attr("dataOption");
		player2Ref.update({
			option: player2option
		});

		$("#player2option").text(player2option);

	});

	//listener after both players have made option
	playersRef.on("value", function(snapshot) {

		//this fires if both players are seated and have selected options
		if(snapshot.child(1).exists() === true && snapshot.child(2).exists() === true && snapshot.child(1).child("option").exists() === true && snapshot.child(2).child("option").exists() === true) {

			var player1option = snapshot.val()[1].option;
			var player2option = snapshot.val()[2].option;
			player1Ref.child("option").remove();
			player2Ref.child("option").remove();
			// var player1Name = snapshot.val()[1].name;
			// var player2Name = snapshot.val()[2].name;
			var player1Wins = snapshot.val()[1].wins;
			var player2Wins = snapshot.val()[2].wins;

			$("#player1option").text(player1option);
			$("#player2option").text(player2option);

			//game logic for determing who wins

			if(player1option === "Rock" && player2option === "Rock") {
				$("#outcome").text("You tied!");
			} else if(player1option === "Rock" && player2option === "Paper") {
				player2Wins++;
				player2Ref.update({
					wins: player2Wins
				});
				player2Ref.once("value", function(snapshot) {
					$("#outcome").text(snapshot.val().name + " Won!");
				});
			} else if(player1option === "Rock" && player2option === "Scissors") {
				player1Wins++;
				player1Ref.update({
					wins: player1Wins
				});
				player1Ref.once("value", function(snapshot) {
					$("#outcome").text(snapshot.val().name + " Won!");
				});
			} else if(player1option === "Paper" && player2option === "Rock") {
				player1Wins++;
				player1Ref.update({
					wins: player1Wins
				});
				player1Ref.once("value", function(snapshot) {
					$("#outcome").text(snapshot.val().name + " Won!");
				});
			} else if(player1option === "Paper" && player2option === "Paper") {
				$("#outcome").text("You tied!");
			} else if(player1option === "Paper" && player2option === "Scissors") {
				player2Wins++;
				player2Ref.update({
					wins: player2Wins
				});
				player2Ref.once("value", function(snapshot) {
					$("#outcome").text(snapshot.val().name + " Won!");
				});
			} else if(player1option === "Scissors" && player2option === "Rock") {
				player2Wins++;
				player2Ref.update({
					wins: player2Wins
				});
				player2Ref.once("value", function(snapshot) {
					$("#outcome").text(snapshot.val().name + " Won!");
				});
			} else if(player1option === "Scissors" && player2option === "Paper") {
				player1Wins++;
				player1Ref.update({
					wins: player1Wins
				});
				player1Ref.once("value", function(snapshot) {
					$("#outcome").text(snapshot.val().name + " Won!");
				});
			} else if(player1option === "Scissors" && player2option === "Scissors") {
				$("#outcome").text("You tied!");
			}

			gameNumber++;
			ref.update({
				gameNumber: gameNumber
			});

			$("#player1wins").text(player1Wins);
			$("#player2wins").text(player2Wins);

			setTimeout(function() {
				$("#outcome").empty();
				$("#player1option").empty();
				$("#player2option").empty();
				displayoption(1);
				displayoption(2);
				console.log("DO3");
			}, pauseInterval);
		}
	});

	//Firebase listener for messages
	chat.on("child_added", function(snapshot) {
		var name = snapshot.val().name;
		var time = snapshot.val().time;
		var message = snapshot.val().message;
		var playerColor = snapshot.val().playerNumber;

		var li = $("<li class='message' id='player"+playerColor+"Color' >").text(": " + message + " ");
		li.prepend($("<span class='name'>").text(name));
		li.append($("<span class='timestamp'>").text(time));
		$("#messageBox").append(li);

		$("#messageBox").animate({ scrollTop: $("#messageBox")[0].scrollHeight}, 500);

	});

	chat.on("child_removed", function(snapshot) {
		$("#messageBox").empty();
		console.log("seeing messagebox emptied" + snapshot);
	});

	//send chat text to the database
	$("#enterText").on("click", function(chatEvent) {
		chatEvent.preventDefault();

		if(playerName !== undefined) {

			var message = $("#chatText").val();
			var time = new Date().toLocaleString("en-US", {hour: "numeric", minute: "numeric", second: "numeric"});

			chat.push({
				name: playerName,
				message: message,
				time: time,
				playerNumber: playerNum
			});

			$("#messageBox").animate({ scrollTop: $("#messageBox")[0].scrollHeight}, 100);

		} else {

			var message = $("#chatText").val();
			var time = new Date().toLocaleString("en-US", {hour: "numeric", minute: "numeric", second: "numeric"});

			chat.push({
				name: "Spectator",
				message: message,
				time: time,
				playerNumber: "spectator"
			});

			$("#messageBox").animate({ scrollTop: $("#messageBox")[0].scrollHeight}, 100);

		}

		$("#chatText").val("");
	});

	// Firebase connection listener
	// THIS SHOULD INCLUDE ALL THE CODE NEEDED TO PRUNE ANY EXISTING NODES ON LOGIN BY A FIRST PLAYER
	// I COULD NOT GET FIREBASE TO PRUNE PROPERLY WITHOUT BUILDING AN ALTERNATE USER PRESENCE SETUP
	// THIS WAS THE MOST STRAIGHTFORWARD WAY OF FIXING THAT THE WAY THINGS WERE

	// ugh I didn't even understand what a user presence tracker was until like 3/4ths of a the way through this

	// note 2 I changed the order of certain things and unminified others and suddenly the code works again
	// (╯°□°）╯︵ ┻━┻

	// Since I don't have a clear understanding about why my code started working (or stopped again) I've decided to leave
	// this in for handling display errors rather than accidentally leave crap in the database to screw up any game past the first
	// It seems really messy, but it does the job, even if everything isn't cleared correctly by onDisconnect

	connectedRef.on("value", function(snapshot) {
		if(snapshot.val()) {
			var user = connectionsRef.push(true);
			userKey = user.getKey();
			user.onDisconnect().remove();

			if (firstConnect === true) {
				console.log("seeing first connect");
				playersRef.once("value", function(snapshot){ 
					playersConnected = snapshot.numChildren(); 
					console.log("seeingplayers"+playersConnected);
				}).then(function() { 
					if (playersConnected === 0) {
						connectionsRef.once("value", function(snapshot){
							connectionsAtOnce = snapshot.numChildren();
							console.log("connectionsAtOnce" + connectionsAtOnce);
						}).then(function() {
							if(connectionsAtOnce === 1) {
								console.log("seeingremoval");
								chat.remove();
								$("#messagebox").empty();
							}
						});
					}
					if (playersConnected === 1) {
						connectionsRef.once("value", function(snapshot){
							connectionsAtOnce = snapshot.numChildren();
							console.log("connectionsAtOnce" + connectionsAtOnce);
						}).then(function(){
							if (connectionsAtOnce === 1) {
								playersRef.remove();
								firstConnect = false;
								console.log ("trying to remove playersRef");
								chat.remove();
								player2Ref.child("option").remove();
								player1Ref.child("option").remove();
								ref.child("gameNumber").remove();
								$("#messagebox").empty();
								$("#player1option, #player2option, #player1Name, #player2Name").empty();
								$("#player1Name").text("Player 1 Not Ready");
								$("#player1Name").removeClass("player1NameEntered");
								$("#player1Name").addClass("playerNotSeated");
								$("#player2Name").text("Player 2 Not Ready");
								$("#player2Name").removeClass("player2NameEntered");
								$("#player2Name").addClass("playerNotSeated");
								$("#gameMessage").empty();							
							}
						});
					}
				});
			}
		}
	});


	connectionsRef.on("child_removed", function(snapshot) {
		var leftKey = snapshot.getKey();
		var player1Key;
		var player2Key;

		player1Ref.once("value", function(snapshot) {
			if(snapshot.exists() === true) {
				player1Key = snapshot.val().key;
			}
		});

		if(leftKey === player1Key) {

			player1Ref.remove();
			player2Ref.child("option").remove();
			ref.child("gameNumber").remove();
			$("#player1Name").empty();
			$("#player1Name").text("Player 1 Not Ready");
			$("#player1Name").removeClass("player1NameEntered");
			$("#player1Name").addClass("playerNotSeated");
			$("#player1option, #player2option").empty();
			$("#gameMessage").empty();

			if(!playerNum)
			{
				$("#enterGamePanel").css("display","block");
				$("#tooManyPlayers").css("display","none");

			}

			var message = " has left the game.";
			var time = new Date().toLocaleString("en-US", {hour: "numeric", minute: "numeric", second: "numeric"});

			console.log("spectator")
			chat.push({
				name: snapshot.val(),
				message: message,
				time: time
			});
		}

		player2Ref.once("value", function(snapshot) {
			if(snapshot.exists() === true) {
				player2Key = snapshot.val().key;
			}
		});

		if(leftKey === player2Key) {

			player2Ref.remove();
			player1Ref.child("option").remove();
			ref.child("gameNumber").remove();
			$("#player2Name").empty();
			$("#player2Name").text("Player 2 Not Ready");
			$("#player2Name").removeClass("player2NameEntered");
			$("#player2Name").addClass("playerNotSeated");
			$("#player1option, #player2option").empty();
			$("#gameMessage").empty();

			if(!playerNum){

				$("#enterGamePanel").css("display","block");
				$("#tooManyPlayers").css("display","none");

			}

			var message = " has left the game.";

			var time = new Date().toLocaleString("en-US", {hour: "numeric", minute: "numeric", second: "numeric"});

			chat.push({
				name: snapshot.val(),
				message: message,
				time: time
			});
		}
	});
});