// @ts-nocheck
import { doc, getDoc, deleteDoc, collection } from "firebase/firestore";
import { ref, deleteObject } from "firebase/storage";
import { db } from "$lib/firebase/firebase";


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


export {
    getBuyerLocation,
    getUserEmail,
    getBuyerusername
}