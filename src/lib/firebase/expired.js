// @ts-nocheck
import nodemailer from "nodemailer";
import { deleteApp, getApp, getApps, initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc, deleteDoc } from "firebase/firestore";
import { getStorage, ref, deleteObject } from "firebase/storage";
 
 // Email set up
 let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'auctionsphereautomated@gmail.com',
        pass: '#AuctionSpherePass'
    }
});
async function getUserEmail(userID, seller) {
    if (seller) {
        const userRef = doc(db, 'user', userID);
        const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        const userData = docSnap.data();
        return userData.email;
    } else {
        console.log('document does not exist!');
    }
    } else {
        const userRef = doc(db, 'user', userID);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            const userData = docSnap.data();
            return userData.email;
        } else {
            console.log('document does not exist!');
            return false;
        }
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

// Retrieves the buyers address
async function getBuyerLocation(userID) {
    const userRef = doc(db, 'user', userID);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        const userData = docSnap.data();
        let address = `${userData.address}\n${userData.poscode}\n${userData.country}`
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

function handleExpiredListings(){
    let endedListings = fetchExpiredListings();
    for (listing in endedListings) {
        let sellerEmail = getUserEmail(listing.sellerID, true)
        let buyerEmail = getUserEmail(listing.highestBidderID, false)
        // If item was sold
        if (buyerEmail != false) {
            let mailContentSeller = {
                from: 'auctionsphereautomated@gmail.com',
                to: sellerEmail,
                subject: 'Your Item Has Been Sold',
                text: `please send ${listing.title} to \n ${getBuyerLocation(listing.highestBidderID)}\n \nDo not reply to this email as it is an automated email`,
            } 
            transporter.sendMail(mailContentSeller, function(error, info){
            if(error) {
                console.log(error);
            } else {
                console.log('Email Sent: ' + info.response);
            }
            });

            let mailContentBuyer = {
                from: 'auctionsphereautomated@gmail.com',
                to: buyerEmail,
                subject: 'Congratulations on your purchase',
                text: `you have bought ${listing.title} for ${listing.price}\n \nDo not reply to this email as it is an automated email`,
            } 
            transporter.sendMail(mailContentBuyer, function(error, info){
            if(error) {
                console.log(error);
            } else {
                console.log('Email Sent: ' + info.response);
            }
            });
        } else {
            // Expired listing
            let mailContentSeller = {
                from: 'auctionsphereautomated@gmail.com',
                to: sellerEmail,
                subject: 'Your Listing has Expired',
                text: `Your listing: ${listing.title} has expired\n \nDo not reply to this email as it is an automated email`,
            } 
            transporter.sendMail(mailContentSeller, function(error, info){
            if(error) {
                console.log(error);
            } else {
                console.log('Email Sent: ' + info.response);
            }
            });
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
    handleExpiredListings
}