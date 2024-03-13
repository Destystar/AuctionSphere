// @ts-nocheck
//import nodemailer from 'nodemailer';
import { deleteApp, getApp, getApps, initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc, deleteDoc, collection } from "firebase/firestore";
import { getStorage, ref, deleteObject } from "firebase/storage";
import { db } from "$lib/firebase/firebase";

 // Email set up
//  const transporter = nodemailer.createTransport({
//     service: 'gmail',
//     auth: {
//         user: 'auctionsphereautomated@gmail.com',
//         pass: '#AuctionSpherePass'
//     }
//  });

async function getUserEmail(userID) {
        const userRef = doc(db, 'user', userID);
        console.log(userID);
        const docSnap = await getDoc(userRef);
    if (docSnap.exists()) {
        const userData = docSnap.data();
        console.log(userData.email);
        return userData.email;
    }
}

// Delete image
async function deleteImage(imageURL) {
    const storageRef = ref(storage, imageURL);
    await deleteObject(storageRef);
}

// Delete bids
async function deleteBids(listingID) {
    const bidsCol = collection(db, 'bids');
    const qBids = query(bidsCol, where('listingID', '==', listingID));
    const querySnapshot = await getDocs(qBids);

    querySnapshot.forEach((doc) => {
        deleteDoc(doc.ref);
    });
}

// Retrieves the Buyers Username
async function getBuyerusername(userID){
    const userRef = doc(db, 'user', userID);
    const docSnap = await getDoc(userRef);
    if (docSnap.exists()) {
        const userData = docSnap.data();
        let username = userData.username;
        return username;
    }
}

// Retrieves the buyers address
async function getBuyerLocation(userID) {
    const userRef = doc(db, 'user', userID);
    const docSnap = await getDoc(userRef);
    if (docSnap.exists()) {
        const userData = docSnap.data();
        let address = `${userData.address}\n${userData.postcode}\n${userData.country}`
        return address;
    }
}

async function fetchExpiredListings() {
    try {
        const listingsCol = collection(db, 'listings');
        let endedListings = [];
        let currentTime = firebase.firestore.Timestamp.now();

        // Search by expiry date
        let qSearchTerm = query(
            listingsCol,
            where('end', '<', currentTime),
            limit(itemsPerPage)
        );
        const querySnapshot = await getDocs(qSearchTerm);
        const docs = querySnapshot.docs.map(doc => {
            return doc.data();
        });
        endedListings = [...endedListings, ...docs];
        
        return endedListings;
    } catch (error) {
        console.error('Error fetching search results:', error);
    }
}

function handleExpiredListing(listing){
    let sellerEmail = getUserEmail(listing.sellerID, true);
    let buyerEmail = getUserEmail(listing.highestBidderID, false);
    deleteImage(listing.imageURL);
    deleteBids(listing.listingID);
    deleteDoc(listing);
}

function handleExpiredListings(){
    let endedListings = fetchExpiredListings();
    for (listing in endedListings) {
        let sellerEmail = getUserEmail(listing.sellerID);
        let buyerEmail = getUserEmail(listing.highestBidderID);
        // If item was sold
        if (buyerEmail != false) {
            // Sends the seller an email
            // const mailOptionsSellerSold = {
            //     from: 'auctionsphereautomated@gmail.com',
            //     to: sellerEmail,
            //     subject: 'Your Item Has Been Sold',
            //     text: `please send ${listing.title} to \n ${getBuyerLocation(listing.highestBidderID)}\n \nDo not reply to this email as it is automated and you will not recieve a response`
            // }
            // transporter.sendMail(mailOptionsSellerSold)
            // Sends the buyer an email
            // const mailOptionsBuyerSold = {
            //     from: 'auctionsphereautomated@gmail.com',
            //     to: buyerEmail,
            //     subject: 'Congratulations on your purchase',
            //     text: `you have bought ${listing.title} for ${listing.price}\n \nDo not reply to this email as it is automated and you will not recieve a response`
            // }
            // transporter.sendMail(mailOptionsBuyerSold)
        } else {
            // Expired listing
            // const mailOptionsExpired = {
            //     from: 'auctionsphereautomated@gmail.com',
            //     to: sellerEmail,
            //     subject: 'Your Listing has Expired',
            //     text: `Your listing: ${listing.title} has expired and has been removed\n \nDo not reply to this email as it is automated and you will not recieve a response`
            // }
            // transporter.sendMail(mailOptionsExpired)
        }
        // Deletes the image from storage
        deleteImage(listing.imageURL);
        // Deletes the bids for this listing
        deleteBids(listing.listingID);
        // Deletes the listing
        deleteDoc(listing);
    }
}

export {
    handleExpiredListings,
    handleExpiredListing,
    getBuyerLocation,
    getUserEmail,
    getBuyerusername
}