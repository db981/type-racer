# type-racer

This project is my implementation of the popular web-based typing game TypeRacer. It works by presenting a prompt for the user to type out, and displays the user's progress in the form of a car travelling across the screen towards a finish line. The game tracks your words per minute (WPM) typed and displays it to the user in real time.

I created this project in React and used state variables extensively to track user progress and online game information. To facilitate online games, I used the socket.io Websocket library to connect clients to a Node/Express server which connects users together and matchmakes competitive races. During online games users see the cars and WPMs of opponents so they can track their progress against other users. 

The application has a practice mode that is available even when the server is offline.

Live at: https://db981.github.io/type-racer/ (Server not currently hosted so only practice mode is available)

The companion Express app is found at: https://github.com/db981/type-racer-backend
