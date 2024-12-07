# Contributions Report

This document summarizes the contributions made by each team member to the codebase and overall project efforts.

## Team Members and Their Contributions

### Jonathan
- **Primary Responsibilities:** Frontend development and UI improvements.
- **Key Contributions:**
  - Refactored the Welcome Page (login/signup).
  - Implemented the initial code for the home (rent) page.
  - Made various UI improvements, including color adjustments and aligning the frontend with backend changes.
  - Added an e2e test pipeline (now outdated and no longer fully functional).
  
### Allen
- **Primary Responsibilities:** Backend implementation and chat system.
- **Key Contributions:**
  - Developed backend features for the rent page and chat system.
  - Built the frontend for the chat system, including the messaging tab, chat window, and rent page chat popup.

### Jason
- **Primary Responsibilities:** Backend integration and map functionality.
- **Key Contributions:**
  - Implemented backend logic for uploading lease details (excluding image handling) to Firestore.
  - Added map markers to the Rent Page, allowing users to view property details, location, and cost.
  - Explored swipe mechanics for listing navigation and created a demo (not integrated).
  - Assisted with merging pull requests to the main branch.

### Collin
- **Primary Responsibilities:** Design and profile-related frontend development.
- **Key Contributions:**
  - Designed the app's logo, mockups, and style guide.
  - Created the Profile Page frontend, including profile editing features.
  - Implemented login and signup with Google Firebase Authentication.
  - Linked authentication to the database and handled lease image uploads with unique URLs.
  - **Note:** Line count inflated by uploading Expo boilerplate code.

### Haibo
- **Primary Responsibilities:** Frontend development and documentation.
- **Key Contributions:**
  - Developed the PostRentalScreen, including layout, styling, and features like picture-taking, gallery selection, and date setting.
  - Styled the Welcome Page with a wave component background.
  - Drafted design documents, user manuals, and API descriptions.
  - Added CI checks for pull request validation.
  - Contributed to deployment setup.
  - **Note:** Line count inflated by pushing `package.json` to main.

### Amy
- **Primary Responsibilities:** Both frontend and backend contributions.
- **Key Contributions:**
  - Developed the favorited listings functionality, enabling adding, viewing, and deleting favorites.
  - Improved UI across the app and enhanced error handling for signup and other features.
  - Ensured robust functionality in the Profile and Rent Page.

---

## Explanation of Contributors Graph

The contributors graph on GitHub shows disparities in contributions due to the following:
- **Frontend Team (Jonathan, Haibo, Collin):** Higher commit counts reflect their focus on UI and frontend features.
- **Backend Team (Allen, Jason, Amy):** Initially focused on backend work (mainly Firebase), potentially resulting in fewer frontend commits despite significant backend contributions.

Additionally:
- Collin's line count is inflated by uploading Expo boilerplate code.
- Haibo's line count is inflated due to pushing `package.json` to main.
- Pair programming and collaborative efforts were central to the team, with certain tasks committed under a single account.

---

## Acknowledgments

We acknowledge that every team member contributed meaningfully to the success of this project. Any differences in the commit data reflect our collaborative work style rather than individual effort. Despite varying focuses, all members played a critical role in delivering a functional and well-designed application.
