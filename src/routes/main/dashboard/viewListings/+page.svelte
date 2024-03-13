<script>
    // @ts-nocheck
    
    import { onMount } from 'svelte';
    import { collection, query, where, getDoc, doc, updateDoc, getDocs, getCountFromServer } from "firebase/firestore";
    import { db, auth } from "$lib/firebase/firebase";
    import { writable } from 'svelte/store';
    import { getBuyerusername, getBuyerLocation, getUserEmail } from '$lib/firebase/expired';

    let searchQuery = '';
    let searchResults = [];
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

    async function handleTransaction(currency, sellerID, buyerID, price){
        const sellerRef = doc(db, 'user', sellerID);
        const sellerDocSnap = await getDoc(sellerRef);
        if (sellerDocSnap.exists()) {
            const sellerData = sellerDocSnap.data();
            switch (currency) {
                case "GBP":
                    let sellerGBP = sellerData.GBP + price;
                    await updateDoc(sellerRef, {
                        GBP: sellerGBP
                    });
                    break;
                case "EUR":
                    let sellerEUR = sellerData.EUR + price;
                    await updateDoc(sellerRef, {
                        EUR: sellerEUR
                    });
                    break;
                case "USD":
                    let sellerUSD = sellerData.USD + price;
                    await updateDoc(sellerRef, {
                        USD: sellerUSD
                    });
                    break;
                case "JPY":
                    let sellerJPY = sellerData.JPY + price;
                    await updateDoc(sellerRef, {
                        JPY: sellerJPY
                    });
                    break;
            }
        }
        const buyerRef = doc(db, 'user', buyerID);
        const buyerDocSnap = await getDoc(buyerRef);
        if (buyerDocSnap.exists()) {
            const buyerData = buyerDocSnap.data();
            switch (currency) {
                case "GBP":
                    let buyerGBP = buyerData.GBP - price;
                    await updateDoc(buyerRef, {
                        GBP: buyerGBP
                    });
                    break;
                case "EUR":
                    let buyerEUR = buyerData.EUR - price;
                    await updateDoc(buyerRef, {
                        EUR: buyerEUR
                    });
                    break;
                case "USD":
                    let buyerUSD = buyerData.USD - price;
                    await updateDoc(buyerRef, {
                        USD: buyerUSD
                    });
                    break;
                case "JPY":
                    let buyerJPY = buyerData.JPY - price;
                    await updateDoc(buyerRef, {
                        JPY: buyerJPY
                    });
                    break;
            }
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
                            <div class="flex flex-col">
                                Buyer Info:
                                <div class="ml-4">
                                    {#if numBids[result.listingID] > 0 && $timers[result.listingID] === 'Listing Ended'}
                                        <dt class="text-m font-medium text-gray-500">Address:</dt>
                                        {#await getBuyerLocation(result.highestBidderID)}
                                            <p>Loading buyer location...</p>
                                        {:then location}
                                            <dd class="mt-1 text-m font-bold text-neutral-950">{location}</dd>
                                        {:catch error}
                                            <dd class="mt-1 text-m font-bold text-red-700">Error loading buyer location</dd>
                                        {/await}
                                        <dt class="text-m font-medium text-gray-500">Username:</dt>
                                        {#await getBuyerusername(result.highestBidderID)}
                                            <p>Loading buyer username...</p>
                                        {:then username} 
                                            <dd class="mt-1 text-m font-bold text-neutral-950">{username}</dd>
                                        {:catch}
                                            <dd class="mt-1 text-m font-bold text-red-700">Error loading buyer username</dd>
                                        {/await}
                                        <dt class="text-m font-medium text-gray-500">Email:</dt>
                                        {#await getUserEmail(result.highestBidderID)}
                                            <p>Loading buyer email...</p>
                                        {:then email} 
                                            <dd class="mt-1 text-m font-bold text-neutral-950">{email}</dd>
                                        {:catch}
                                            <dd class="mt-1 text-m font-bold text-red-700">Error loading buyer email</dd>
                                        {/await}
                                    {:else if numBids[result.listingID] === 0}
                                        <dd class="mt-1 text-m font-bold text-red-700">There are no bids on this listing</dd>
                                    {:else}
                                        <dd class="mt-1 text-m font-bold text-red-700">The listing has not finished yet</dd>
                                    {/if}
                                </div>
                            </div>
                        <div>
                            {#if numBids[result.listingID] > 0 && $timers[result.listingID] === 'Listing Ended'}
                                <button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" type="submit" on:click={handleTransaction(result.currency, user.uid, result.highestBidderID, result.price)}>Complete Transaction</button>
                            {/if}
                        </div>
                    </div>   
                </div>
            {/each}
        {:else}
            <p class="text-gray-500">You don't have any active listings.</p>
        {/if}
       </div>      
     </div>