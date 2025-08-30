# CloudMate - weather web application
<img width="1800" height="900" alt="image" src="https://github.com/user-attachments/assets/6287477a-608d-4d3c-a4d8-da8a14c39d68" />

This application is built in the Node.js and Express framework. EJS is the templating engine that is used for manipulating the frontend. I also used AJAX fetch to manipulate DOM. Bootstrap is also used in frontend. 

## Download & Run app

1. **Setup the OpenWeatherMap API account**
    
      _Go to the link [OpenWeatherMapAPI](https://openweathermap.org/api) click Sign Up, then Sign Up with your username and password. In the section My API keys you can find your API key, save it for now or just remember where you can find it_.

2. **Clone the project from this repository on github.**

    To run the following commands, you need to have Git installed on your local machine.  If you don't have it, download it [here](https://git-scm.com/downloads).

   Open VS code terminal or git bash and enter this commands
     ```bash
       git clone https://github.com/ncrncec23/weather-app-owm.git # Clone the repository from github
    
       cd <name-of-your-folder> # Change name_of_your_folder to your folder name
    ```    
3. **Installing dependencies and running Node.js app**

    First you need to install Node if you don't already have it. Install it [here](https://nodejs.org/en)
   
    Check the version if anything pops up it's ok. If not you have not installed it correctly
    ```bash
       node -v # Checks the node version
       npm -v # Checks the node package manager version
    ```
   To install dependencies run
   ```bash
       npm i # Install dependencies
   ```
   Create .env file and save your API_KEY in the file
   ```bash
       touch .env # Creating the .env file
       API_KEY="<your_api_key>" # Enter your API_KEY in this format
   ```
   After creating .env you can run the application by entering
   ```bash
       nodemon index.js 
       # OR
       node index.js
   ```
       






