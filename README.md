**TCG WEB SCRAPER**

**Description:**

This project is a trading card price tracker built using Node.js. It periodically scrapes prices of specific cards from TCGPlayer and sends an email notification if the price drops below a desired threshold. It can be used for any card listed on TCGPlayer, not just Pokémon cards


**Setup Instructions:**

**Clone the Repository:**

1. Clone the repository containing the project files to your local machine.

**Install Dependencies:**

2. Navigate to the project directory and run the following command to install the required dependencies:

   `npm install`

**Setup Environment Variables:**

3. Create a .env file in the project directory and define the following environment variables:

    `BOT_EMAIL=your_bot_email@provider.com`

    `EMAIL_PASSWORD=your_email_password`

    `SEND_EMAIL=your_target_email@provider.com`

Replace your_bot_email@provider.com with the email address you want to use for sending notifications, your_email_password with the password of that email account, and your_target_email@provider.com with the email address where you want to receive notifications.

**Run the Project**

4. Execute the following command to start the price tracking:
   
      `node cardScraper.js`



Note: Look into pm2 for multiple nodes or clusters for multiple instance runs.


Thanks :)
