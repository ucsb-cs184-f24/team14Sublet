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

## Frontend

- React-Native (w/ EXPO framework)

## Backend

- Firebase

# App Planning

# User Stories

## As a subletter:
- As a subletter, the application should send me more leases that are similar the ones that I like
- As a subletter, I would like to show interest or disinterest in specific leases
- As a subletter, I want to talk to the subleaser about the leases I like
- As a subletter, I want to be able to narrow down my search by filtering criteria (e.g., rent, room type, proximity to campus)

## As a subleaser:
- As a subleaser, I want to post my leases
- As a subleaser, I want to track my posted leasers

## As a user:
- As a user, I want to be able to create an account and log in

## As an admin:
- As an admin, I want to browse and manage the data of customer, property, and transaction

# Project Team

## Frontend
- Jonathan Herring - @jonathan-herring
- Collin Qian - @CollinQ
- Haibo Yang - @YoungHypo

## Backend
- Allen Qiu - @aqiu04
- Amy Wang - @awaang
- Jason Vu - @Firoc
