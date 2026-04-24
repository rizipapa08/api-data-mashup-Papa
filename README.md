**BookReads: A Digital Library Book Tracker**

**1. Project Description**
    Made for book collectors and/or librarians, BookReads is a local web application that simulates how a digital library staff member or personal user manages a book inventory. It demonstrates how systems connect through APIs, retrieve external data, and store and update records locally. The application allows users to search for books using an external API, select and add them to a local library inventory, and manage their circulation status. Once added, books can be marked as Available or Borrowed, with automatic tracking of borrower details and due dates. If a book is not returned within the standard 7-day loan period, it is automatically marked as Overdue.

**2. Track: COMTECH (Communications Technology)**
**3. APIs Used**
    Open Library Search API: https://openlibrary.org/dev/docs/api/search and https://openlibrary.org/search.json
    The Open Library Search API is used to retrieve book data based on user input such as title or ISBN. It returns relevant book information including title, author, publication year, and cover image. This API serves as the external data source for populating the system’s inventory.

**4. Setup Instructions**
    Installation: No installation or dependencies are required.
    Run Locally: 
   
    - Download or clone the project folder
   
    - Ensure the following files are in the same directory:
        index.html
        style.css
        script.js
   
    - Open index.html in any web browser
    
    The application runs entirely on the user side using local storage.

**5. Data Integration Explanation**
    The system follows a structured workflow that simulates a real library circulation process.
    First, the user **enters a book title** or ISBN into the search bar. The application sends a request to the **Open Library Search API**, which returns a list of matching books. These results are displayed in the interface, allowing the user to select a book.
    Once a book is selected, it is **added to the local inventory**. At this stage, the application transforms external API data into an internal record format and stores it using the browser’s local storage. This ensures that data persists even after refreshing the page.
    Each book in the inventory has a status that reflects its availability. By default, books are marked as Available. When a book is borrowed, the user inputs the borrower’s name, and the system automatically assigns a standard loan period of 7 days. The due date is calculated and stored along with the record.
    The system continuously checks the current date against stored due dates. If a borrowed book exceeds its due date, its status is automatically updated to Overdue. This logic simulates real-time tracking without requiring a backend system.
    The dashboard dynamically displays counts of total books, available books, borrowed books, and overdue books. Users can also filter the inventory by these categories, allowing for easier management and monitoring.

**6. Known Limitations**    
    
    - Data is stored only in browser local storage and is not shared across devices
    
    - No real user authentication or borrower validation
    
    - Manual return process (books must be marked available manually)

**7. AI Usage Disclosure**    
    AI tools were used throughout the development of this project as a collaborative aid. Specifically, AI was used for:
       
        - Debugging and improving code logic
        
        - Enhancing UI/UX decisions and workflow design
        
    All core functionality, system logic, and integration flow were implemented and understood by the developer. The final application reflects a collaborative effort where AI supported development, but the overall system design and customization were actively carried out by the developer.
