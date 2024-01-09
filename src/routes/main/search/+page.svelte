<script>
// @ts-nocheck

  import { onMount } from 'svelte';
  import { collection, query, where, limit, getDoc, setDoc, doc, updateDoc, getDocs, runTransaction } from "firebase/firestore";
  import { db, storage, auth } from "$lib/firebase/firebase";
  import { getDownloadURL, ref } from "firebase/storage";
  import { eng } from 'stopword';
  import { writable } from 'svelte/store';

  let searchQuery = '';
  let searchResults = [];
  const itemsPerPage = 10;
  let currentPage = 1;
  let bidValue;
  let category = "Any";
  let displayCurrency = "GBP";
  let timers = writable({});
  let bids = writable({});
  const stopwords = eng;
  let currencySymbol = "£";
  const user = auth.currentUser;

  async function getImageUrl(imagePath) {
    const imageRef = ref(storage, imagePath);
    const imageUrl = await getDownloadURL(imageRef);
    return imageUrl;
  }

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

  function removeStopwordsFromString(str, stopwords) {
    let words = str.split(" ");
    words = words.filter((word) => !stopwords.includes(word));
    return words;
  }

  function calculateTimeLeft(time, id) {
    let endDate = new Date(time.seconds * 1000 + time.nanoseconds / 1000000);
    let currentTime = new Date();
    let diff = endDate.getTime() - currentTime.getTime();
    console.log(diff);

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
      // Stopword filtering
      let searchQueryArray = removeStopwordsFromString(searchQuery, stopwords)
      console.log(searchQueryArray);
      let allResults = [];

      // Search by term
      let qSearchTerm = query(
        listingsCol,
        where('searchTerms', 'array-contains-any', searchQueryArray),
        limit(itemsPerPage)
      );
      const querySnapshot = await getDocs(qSearchTerm);
      const docsWithImages = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return { ...data, imageUrl: data.imageURL };
      });
      allResults = [...allResults, ...docsWithImages];
      // Filter by category
      if (category !== 'Any') {
        allResults = allResults.filter(result => result.category === category);
      }
      // Filter by currency
      allResults = allResults.filter(result => result.currency === displayCurrency);
      // Filter out results where the sellerID is user ID
      /*
         uncomment in final build
      */
      // allResults = allResults.filter(result => result.sellerID === user.uid);
      // Remove duplicates
      searchResults = Array.from(new Set(allResults.map(item => JSON.stringify(item)))).map(item => JSON.parse(item));
      console.log(searchResults.length);

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

  function handleCategoryChange(event) {
    category = event.target.value;
    fetchSearchResults();
  }

  function handleCurrencyChange(event) {
    displayCurrency = event.target.value;
    if(displayCurrency === "GBP"){
      currencySymbol = "£";
    } else if (displayCurrency === "EUR") {
      currencySymbol = "€"
    } else if (displayCurrency === "USD") {
      currencySymbol = "$";
    } else if (displayCurrency === "JPY") {
      currencySymbol = "¥";
    }
    fetchSearchResults();
  }

  async function handleBid(price, result){
    console.log("Running handleBid: " + price + result.listingID);
    let userAmount = 0;
    const usersRef = collection(db, 'user');
    let userQuery = query(usersRef, where('email', '==', user.email));

    const userSnap = await getDocs(userQuery);
    console.log("User snapshot: ", userSnap);
    if (!userSnap.empty) {
        const userDoc = userSnap.docs[0];
        console.log("User document: ", userDoc);
        switch(displayCurrency) {
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


  function handleSearch() {
    fetchSearchResults();
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


  onMount(fetchSearchResults);
</script>


<div class="min-h-screen bg-gray-100 py-4 px-4 sm:px-6 lg:px-8">
<div class="container mx-auto flex justify-center space-x-4">
  <input type="text" bind:value={searchQuery} placeholder="Search..." class="w-1/2 px-2 py-1.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" on:keydown={handleKeyDown} />
  <button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" type="submit" on:click={handleSearch}>Search</button>
  <!-- Category dropdown -->
  <select id="category" bind:value={category} on:change={handleCategoryChange} class="w-1/16 shadow appearance-none border rounded py-2 px-2 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
      <option value="Any">Any</option>
      <option value="Antiquity">Antiquities & Collectibles</option>
      <option value="Baby">Baby & Kids</option>
      <option value="Books">Books & Magazines</option>
      <option value="Discs">DvDs & CDs</option>
      <option value="Fashion">Fashion</option>
      <option value="Health">Health & Beauty</option>
      <option value="Home">Home & Furniture</option>
      <option value="Music">Music & Instruments</option>
      <option value="Office">Office Supplies</option>
      <option value="Sports">Sports & Outdoors</option>
      <option value="Technology">Technology</option>
      <option value="Toys">Toys & Games</option>
      <option value="VideoGameConsoles">Video Game Consoles</option>
      <option value="VideoGames">Video Game Discs & Cartridges</option>
    </select> 
    <select id="currency" bind:value={displayCurrency} on:change={handleCurrencyChange} class="w-1/16 shadow appearance-none border rounded py-2 px-2 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
      <option value="GBP">GBP</option>
      <option value="EUR">EUR</option>
      <option value="USD">USD</option>
      <option value="JPY">JPY</option>
    </select>
  </div>
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
            <dd class="mt-1 text-m font-bold text-blue-700">{currencySymbol}{parseFloat(result.price).toFixed(2)}</dd>
          </div>
        </div>
      </div>
      <div class="flex ml-4 justify-center items-center space-x-4">
        <dt class="text-m font-medium text-gray-500">Your Bid:</dt>
        <input type="number" placeholder="current price: {parseFloat(result.price).toFixed(2)}" bind:value={$bids[result.listingID]} min={result.price + 0.01} class="mt-1 text-m text-blue-700 font-bold" />
        <button on:click={() => handleBid($bids[result.listingID], result)} class="mt-1 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Place Bid</button>
     </div>     
    </div>
    {/each}
    {:else}
    <p class="text-gray-500">No results found.</p>
    {/if}
   </div>      
 </div>