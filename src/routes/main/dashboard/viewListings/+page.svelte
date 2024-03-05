<script>
    // @ts-nocheck
    
    import { onMount } from 'svelte';
    import { collection, query, where, getDoc, setDoc, doc, updateDoc, getDocs, runTransaction, getCountFromServer } from "firebase/firestore";
    import { db, storage, auth } from "$lib/firebase/firebase";
    import { getDownloadURL, ref } from "firebase/storage";
    import { eng } from 'stopword';
    import { writable } from 'svelte/store';

    let searchQuery = '';
    let searchResults = [];
    let currentPage = 1;
    let timers = writable({});
    let numBids = writable({});
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

    async function getNumBids(listingID){
        try {
            const bidCol = collection(db, 'bids');
            const q = query(bidCol, where('listingID', '==', listingID));
            const snapshot = await getCountFromServer(q);
            numBids[listingID] = snapshot.data().count;
        } catch (error) {
            console.error('Error fetching search results:', error);
        }
    }


    async function fetchSearchResults() {
        console.log("attempting search");
        try {
            const listingsCol = collection(db, 'listings');
            const bidsCol = collection(db, 'bids');
            let allResults = [];
            // query all results where the sellerID is the same as the user ID
            let qSearchTerm = query(
                listingsCol,
                where('sellerID', '==', user.uid),
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
                getNumBids(searchResults[i].listingID);
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

    function handlePageChange(page) {
    currentPage = page;
    fetchSearchResults();
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
                <dt class="text-m font-medium text-gray-500">There are Currently:</dt>
                <dd class="mt-1 text-m font-bold text-blue-700">{numBids[result.listingID]} bids</dd>
              </div>
            </div>
          </div>   
        </div>
        {/each}
        {:else}
        <p class="text-gray-500">You don't have any active listings.</p>
        {/if}
       </div>      
     </div>