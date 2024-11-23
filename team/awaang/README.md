# My contributions

Favorite Listing Feature

## Structure
[Homelette/components/RentPage.tsx](https://github.com/ucsb-cs184-f24/team14sublet/blob/awaang-feature-favorite/Homelette/components/RentPage.tsx)

## Starting Point
Currently, there is no favorited listings section on the app, and there is a favorite button on each listing but it does not function properly (no connection to backend).

screenshots:
ProfilePage.PNG
RentPage.PNG

## Main Information
Listings are now favorited and unfavorited when clicked, and will print a message in the console for any actions. The feature will also update the the Firebase backend. Every lease stored in Firebase has an array called interested_users_ids. This array will contain a list of the ids of the users that favorited it. Also, each user will have an array called interested_listing_ids, which will store a list of the ids that the user has favorited.

updated status of RentPage: 
NewRentPage.PNG
