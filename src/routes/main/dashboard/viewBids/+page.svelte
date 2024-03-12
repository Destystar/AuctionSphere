<script>
    // @ts-nocheck
    
    import { onMount } from 'svelte';
    import { collection, query, where, getDoc, setDoc, doc, updateDoc, getDocs, runTransaction } from "firebase/firestore";
    import { db, storage, auth } from "$lib/firebase/firebase";
    import { writable } from 'svelte/store';

    let searchQuery = '';
    let searchResults = [];
    let timers = writable({});
    let bids = writable({});
    const user = auth.currentUser;

    onMount(fetchSearchResults);

    function mergeSort(arr) {
    if (arr.length <= 1) {
        return arr;
    }

    const mid = Math.floor(arr.length / 2);
    const left = mergeSort(arr.slice(0, mid));
    const right = mergeSort(arr.slice(mid));

    let result = [];
    let leftIndex = 0;
    let rightIndex = 0;

    while (leftIndex < left.length && rightIndex < right.length) {
        if (left[leftIndex].title < right[rightIndex].title) {
        result.push(left[leftIndex]);
        leftIndex++;
        } else {
        result.push(right[rightIndex]);
        rightIndex++;
        }
    }

    return result.concat(left.slice(leftIndex)).concat(right.slice(rightIndex));
    }


    function calculateTimeLeft(time, id) {
    let endDate = new Date(time.seconds * 1000 + time.nanoseconds / 1000000);
    let currentTime = new Date();
    let diff = endDate.getTime() - currentTime.getTime();

    if (diff <= 0) {
        return $timers[id] = 'Listing Ended';
    } else {
        let days = Math.floor(diff / (1000 * 60 * 60 * 24));
        let hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        let minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        let seconds = Math.floor((diff % (1000 * 60)) / 1000);

        if (!$timers[id]) {
        $timers[id] = setInterval(() => {
            diff -= 1000;
            if (diff <= 0) {
            clearInterval($timers[id]);
            delete $timers[id];
            } else {
            days = Math.floor(diff / (1000 * 60 * 60 * 24));
            hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            seconds = Math.floor((diff % (1000 * 60)) / 1000);
            $timers[id] = `${days}d ${hours}h ${minutes}m ${seconds}s`;
            }
        }, 1000);
        }
        return $timers[id];
    }
    }


    async function fetchSearchResults() {
        console.log("attempting search");
        try {
            const listingsCol = collection(db, 'listings');
            const bidsCol = collection(db, 'bids');
            let allResults = [];

            // User bids retrieved
            const userBidsQuery = query(bidsCol, where('bidderID', '==', user.uid));
            const userBidsSnapshot = await getDocs(userBidsQuery);
            const userBids = userBidsSnapshot.docs.map(doc => doc.data().listingID);
            console.log(userBids);
            // search by the listingIDs retrieved from bids
            let qSearchTerm = query(
                listingsCol,
                where('listingID', 'in', userBids),
            );
            const querySnapshot = await getDocs(qSearchTerm);
            const docsWithImages = querySnapshot.docs.map(doc => {
                const data = doc.data();
                return { ...data, imageUrl: data.imageURL };
            });
            allResults = [...allResults, ...docsWithImages];
            console.log(allResults);
            // Remove duplicates
            searchResults = Array.from(new Set(allResults.map(item => JSON.stringify(item)))).map(item => JSON.parse(item));

            for (let i = 0; i < searchResults.length; i++) {
                $timers[[searchResults[i].id]] = calculateTimeLeft(searchResults[i].end, searchResults[i].listingID);
                if (!searchResults[i].hasOwnProperty('title')) {
                    throw new Error('All objects must have a title property');
                }
            }

            searchResults = mergeSort(searchResults);
            return searchResults;
        } catch (error) {
            console.error('Error fetching search results:', error);
        }
    }


    async function handleBid(price, result, currency){
        console.log("Running handleBid: " + price + result.listingID);
        let userAmount = 0;
        const usersCol = collection(db, 'user');
        let userQuery = query(usersCol, where('email', '==', user.email));

        const userSnap = await getDocs(userQuery);
        console.log("User snapshot: ", userSnap);
        if (!userSnap.empty) {
            const userDoc = userSnap.docs[0];
            console.log("User document: ", userDoc);
            switch(currency) {
                case "GBP":
                    userAmount = userDoc.data().GBP;
                    break;
                case "EUR":
                    userAmount = userDoc.data().EUR;
                    break;
                case "USD":
                    userAmount = userDoc.data().USD;
                    break;
                case "JPY":
                    userAmount = userDoc.data().JPY;
                    break;
                default:
                    console.log('Invalid currency type');
            }
        }
        console.log("User amount: ", userAmount);
        if (userAmount >= price) {
            await runTransaction(db, async (transaction) => {
                const bidRef = doc(db, 'bids', `${user.uid}_${result.listingID}`);
                const listingRef = doc(db, 'listings', result.listingID);

                const listingSnapshot = await transaction.get(listingRef);
                const listingData = listingSnapshot.data();

                console.log("Listing data: ", listingData);
                if (price > listingData.price) {
                    // Update the listing with the new price and highest bidder id
                    transaction.update(listingRef, {
                        highestBidderID: user.uid,
                        price: price,
                    });
                    // Document in Bids created
                    await setDoc(bidRef, {
                        bidderID: user.uid,
                        listingID: result.listingID,
                        amount: price,
                    }, { merge: true });
                } else {
                    console.log("Your bid is not high enough!");
                }
            });
            }
    }


    function getCurrencySymbol(currency) {
        switch(currency) {
            case "GBP":
                return "£";
            case "EUR":
                return "€";
            case "USD":
                return "$";
            case "JPY":
                return "¥";
            default:
                return "£";
        }
    }

    function handleKeyDown(event) {
        if (event.key === 'Enter' && searchQuery !== '') {
            fetchSearchResults();
        }
    }
    </script>
    
    
    <div class="min-h-screen bg-gray-100 py-4 px-4 sm:px-6 lg:px-8">
      <!-- Scrollable container for search results -->
      <div class="overflow-auto m-4 space-y-4">
        {#if searchResults.length > 0}
        {#each searchResults as result (result.listingID)}
        <div class="bg-white shadow-lg rounded-lg overflow-hidden">
          <div class="flex justify-center">
            <div class="flex justify-center">
              <div class="flex-shrink-0">
                <!-- svelte-ignore a11y-img-redundant-alt -->
                <img class="h-40 w-40" src="{result.imageUrl}" alt="Listing image" />
              </div>
              <div class="ml-4">
                <div class="text-lg leading-6 font-medium text-gray-900">{result.title}</div>
                <p class="mt-2 text-sm text-gray-500">{result.description}</p>
              </div>
            </div>
            <div class="flex flex-col">
              <div class="ml-4">
                <dt class="text-m font-medium text-gray-500">Time Left:</dt>
                <dd class="mt-1 text-m text-blue-700 font-bold">{$timers[result.listingID]}</dd>
              </div>
              <div class="ml-4">
                <dt class="text-m font-medium text-gray-500">Current Price:</dt>
                <dd class="mt-1 text-m font-bold text-blue-700">{getCurrencySymbol(result.currency)}{parseFloat(result.price).toFixed(2)}</dd>
              </div>
              <div class="ml-4">
                <dt class="text-m font-medium text-gray-500">You are Currently:</dt>
                <dd class="mt-1 text-m font-bold text-blue-700">{result.highestBidderID === user.uid ? "The highest bidder" : "Not the highest bidder"}</dd>
              </div>
            </div>
          </div>
          <div class="flex ml-4 justify-center items-center space-x-4">
            <dt class="text-m font-medium text-gray-500">Your Bid:</dt>
            <input type="number" placeholder="current price: {parseFloat(result.price).toFixed(2)}" bind:value={$bids[result.listingID]} min={result.price + 0.01} class="mt-1 text-m text-blue-700 font-bold" />
            <button on:click={() => handleBid($bids[result.listingID], result, result.currency)} class="mt-1 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Place Bid</button>
         </div>     
        </div>
        {/each}
        {:else}
        <p class="text-gray-500">You have no active bids.</p>
        {/if}
       </div>      
     </div>