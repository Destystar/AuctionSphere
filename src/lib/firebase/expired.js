// @ts-nocheck
// import sgMail from "@sendgrid/mail";
import { deleteApp, getApp, getApps, initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc, deleteDoc } from "firebase/firestore";
import { getStorage, ref, deleteObject } from "firebase/storage";
 
 // Email set up
 sgMail.setApiKey(import.meta.env.SENDGRID_API_KEY);

// Function to send an email
// async function sendEmail(reciever, sub, mainEmail) {
//     const response = await fetch('/send-email', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify({
//         to: reciever,
//         from: 'auctionsphereautomated@gmail.com',
//         subject: sub,
//         text: mainEmail,
//       }),
//     });

//     if (response.ok) {
//       console.log('Email sent successfully');
//     } else {
//       console.error('Failed to send email');
//     }
//  }

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
            // Sends the seller an email
            // sendEmail(sellerEmail, 'Your Item Has Been Sold', `please send ${listing.title} to \n ${getBuyerLocation(listing.highestBidderID)}\n \nDo not reply to this email as it is an automated email`);
            // Sends the buyer an email
            // sendEmail(buyerEmail, 'Congratulations on your purchase', `you have bought ${listing.title} for ${listing.price}\n \nDo not reply to this email as it is an automated email`);
        } else {
            // Expired listing
            // sendEmail(sellerEmail, 'Your Listing has Expired', `Your listing: ${listing.title} has expired\n \nDo not reply to this email as it is an automated email`);
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