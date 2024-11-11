# Do I Have Enough?

https://youtu.be/XQtlSzmOaCU

## Harvard CS50 Final Project

Do I have enough? is a web application designed in mind of young children who, when out shopping with their parents, wonder whether or not they have enough money to purchase that new item they really want. Whether the child has their own allowance or savings, or the parent wants to set a budget limit on their spending, this application affords the young child a better understanding and comprehension of budgetary restraints.
After registering as a new user (and once the child's found that new item they're looking for), either the child or the parent can input the item's cost from the price tag, hit the "?" button and immediately see whether they can afford the item or not. If they can, they have the option to purchase the product and the amount will deduct from their total current balance. Any time a child receives money they can login to the application, click the "add funds" button and increase their total balance, ready for the next time they go shopping.

#### A note on this project: 
I have used the Claude (Sonnet 3.5) LLM to assist with building this project where required. In some aspects of the code (especially the javascript as this is a language I am yet to learn) I've used Claude to assist with psuedo-code to help with the structure of the code, and also in some cases code generation, mostly in the javascript file. The code I generated with Claude was reviewed by myself as I proceeded, and I requested explanations on every line of code generated to ensure I had a full understanding of the code I was using and its implementation.

## Codebase
As required by the CS50 Final Project guidelines, the files written for the project:

### app.py
Flask User Transaction System
This Flask-based web application provides a foundation for handling user accounts and financial transactions.
The authentication system is built with security in mind, featuring password hashing and session management to keep user data safe. Everything runs on a SQLite database, making it lightweight and perfect for development or small-scale deployments. Users can register, log in, and manage their account balance all through a clean, template-based interface.
Users can add funds to their accounts and make purchases, with all the necessary checks and balances in place. The system ensures sufficient funds are available and handles all database transactions with proper commit and rollback functionality to maintain data integrity.
For developers, the project includes some features like a test user creation function and debug mode for development. The code is structured with Flask best practices in mind, using decorators for route protection and keeping the database operations clean and organized.

### users.db
The database structure for this application is pretty straightforward. It uses a single 'users' table that handles all user-related data. Each user has a unique auto-incrementing ID as the primary key, along with a username that must be unique and a securely hashed password. The balance field, defaulting to 0.0, tracks the user's account funds. The sqlite_sequence table is automatically managed by SQLite to handle the auto-incrementing functionality of the primary key.

### html Template Structure
This web application uses Flask's template inheritance.

The base.html template loads custom JavaScript and CSS, along with specific Google Fonts that balance readability (Libre Franklin) with personality (Barriecito, Sue Ellen Francisco) with young users in mind. The template defines three blocks - title, navigation, and content - allowing child templates to maintain consistent structure while customizing their content.

calculator.html extends the base template to create our main interface. It's split into two functional halves: a number pad interface (left-half) and a user information display (right-half). The number pad implements a classic calculator look and layout with an additional "?" button for the "Can I afford this?" functionality. The right section displays the user's name and balance, along with dynamic result displays including success/failure images and purchase confirmation options. This template also includes a modal system for logout confirmation, preventing accidental session termination.

The authentication templates (login.html and register.html) share similar structure but serve distinct purposes. login provides a straightforward authentication form while register extends this pattern to include password confirmation. Both templates implement error handling through Flask's template variables, displaying validation messages when needed. Form submissions are handled through POST methods, with appropriate routing back to the login page or main interface.

Each template makes extensive use of CSS classes for styling and JavaScript hooks, allowing for dynamic behavior while maintaining clean separation of concerns. The templates are designed to be responsive, with container-based layouts and flexible form styling. Error handling is implemented consistently across all templates, with dedicated CSS classes for error messages and form validation feedback.

### Javascript
The JavaScript is structured around three core modules, each serving a distinct purpose in the application's functionality.

The Calculator module handles numerical input through both click events and keyboard controls. The module uses event delegation for performance, listening for events at the number pad level rather than individual buttons. DOM elements are cached on initialization to avoid repeated queries, while state variables track the current amount and interface status.

The AddFundsModule takes a different approach, dynamically generating its interface through JavaScript rather than static HTML. This choice allows for better encapsulation of the funds-adding functionality and makes the feature more portable. It implements the Fetch API for server communication, with proper error handling and user feedback.

Both modules share a similar pattern of initialization (init/bindEvents pattern) but handle their DOM interactions differently based on their needs. The Calculator maintains a more complex state for handling the checking/result flow, while the AddFundsModule focuses on clean form submission and response handling.

The logout handler demonstrates a simpler module pattern, focusing solely on modal interaction and form submission. It uses event bubbling for efficient event handling and includes keyboard support for accessibility.

### CSS
The CSS implementation creates a playful interface with a focus on accessibility and responsiveness and a youthful design aesthetic. It uses a layered approach, starting with a semi-transparent doodle background overlaid with a gradient for better contrast. The layout employs Flexbox for responsive positioning, with the main container splitting into two equal halves for the calculator and user information displays.

The styling emphasizes interesting user interaction through button animations and shadows, creating a tactile feel with pressing animations and depth effects.
Media queries ensure the interface remains functional across different screen sizes, with appropriate adjustments to font sizes and layout properties. Typography relies heavily on 'Sue Ellen Francisco' and 'Barriecito' fonts for a child-friendly aesthetic. The color palette combines warm backgrounds (#FFF4EA) with accent colors (#C96868, #7EACB5) to maintain visual interest while ensuring readability. The dseign choices here reflect the fun, yet practical aspect of its intended use.

### Summary
This web application is effectively a financial education tool built with Flask to help children understand purchasing decisions. The backend uses Flask with SQLite for user management and balance tracking, implementing secure authentication through password hashing and session management. The frontend combines a clean HTML template structure with playful yet functional CSS styling, featuring custom fonts and interactive elements. The JavaScript implementation is modular, with separate components handling the calculator interface, funds management, and user session control. The application's interface splits into a numerical input pad and a results display, providing immediate visual feedback about purchase affordability. Notable technical features include responsive design, keyboard accessibility, secure transaction handling, and smooth state management across all interactions. The project demonstrates a balanced approach between security (user authentication, transaction validation) and user experience (intuitive interface, immediate feedback), while maintaining clean, maintainable code structure across all layers.
