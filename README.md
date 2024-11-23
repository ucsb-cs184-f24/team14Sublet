# Homelette

A mobile app designed to connect subletters with subtenants in Isla Vista

## Installation Instructions

To get started with the Homelette App, follow these steps:

### Prerequisites
* Ensure you have Node.js installed.

* Install Expo CLI globally by running:
```
npm install -g expo-cli
```
Clone the repository and navigate to the project directory:
```
git clone https://github.com/ucsb-cs184-f24/team14sublet.git
cd homelette
```

Install the necessary dependencies:
```
npm install
```

### Running the App Locally

* Start the development server:
```
expo start
```
* Follow the instructions provided by Expo to run the app on your connected device or an emulator.

### Installation of the APK (v1.0.0-MVP)

* To install the APK directly on your Android device, download it using this link: [Homelette APK](https://expo.dev/artifacts/eas/74zKP9485na2ueiz5bEMWy.apk)

* Download Homelette APK

* Once downloaded, ensure that your device allows installations from unknown sources. Navigate to the downloaded APK file and tap to install.

### Functionality

* You can navigate the app using the navigation bar at the bottom of the screen
* Leases can be posted on the Post page
* Leases can be viewed on the Rent page
* The user can sign out via the button on the Home page
* Profile details can be viewed on the Profile page

### Known Problems

* Attempting to modify profile details will not work (v1.0.0)
* The user must sign out and sign in again in order to see a new lease they posted (v1.0.0)

# Tech Stack

- Development framework: React Native (Expo).
- Database: Firestore.
- Cloud Storage: Firebase Storage.
- Authentication Service: Firebase Authentication.
- Push Messaging: Firebase Cloud Messaging.

# App Planning

# User Stories

## As a subtenant
- I want to be able to view more details/pictures about a property by tapping on it's card on the Rent page (more details: date posted, etc.).
- I want to be able to filter by price, roommate count, amenities include (water, electricity, Wi-Fi), distance from school.
- I want to be able to view a Zillow-like map of clickable posted properties.
- I want to chat with potential subletters.
- I want to favorite/unfavorite listings on the RentPage and view my favorited listings in a favorited listings page.

## As a subletter
- I want to be able to post listings quickly, upload pictures and fill in the necessary details.
- I want to be able to view the status of posted listings (e.g. number of times viewed, number of people interested).
- I want to be able to edit or delete my listing information (e.g. change the rent or add a description).
- I want to receive instant notifications when someone is interested in my listings so that I can respond quickly to potential subleasers.

## As a user
- I want manuals or tutorials of how to use the app.
- I want to be able to edit various details about my profile, such as my password, profile picture, and class info.

# Project Team

## Frontend
- Jonathan Herring - @jonathan-herring
- Collin Qian - @CollinQ
- Haibo Yang - @YoungHypo

## Backend
- Allen Qiu - @aqiu04
- Amy Wang - @awaang
- Jason Vu - @Firoc
