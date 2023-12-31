<script>
    import { onMount } from 'svelte';
    import { collection, query, where, orderBy, limit, getDocs } from "firebase/firestore";
    import { db, storage } from "$lib/firebase/firebase";
    import { getDownloadURL, ref } from "firebase/storage";

  
    let searchQuery = '';
    /**
     * @type {string | any[]}
     */
    let searchResults = [];
    const itemsPerPage = 10;
    let currentPage = 1;
    let category = "Any";

    const sw = require('stopword');
    const stopwords = sw.english;

    /**
     * @param {string | undefined} imagePath
     */
    async function getImageUrl(imagePath) {
      const imageRef = ref(storage, imagePath);
      const imageUrl = await getDownloadURL(imageRef);
      return imageUrl;
    }


    /**
     * @param {string} str
     * @param {string | any[]} stopwords
     */
    function removeStopwordsFromString(str, stopwords) {
      let words = str.split(" ");
      words = words.filter((/** @type {any} */ word) => !stopwords.includes(word));
      return words;
    }

    // @ts-ignore
    function calculateTimeLeft(endTime) {
      const currentTime = new Date();
      // @ts-ignore
      const diff = endTime - currentTime;

      if (diff <= 0) {
        return 'Time\'s up!';
      } else {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        return `${days}d ${hours}h ${minutes}m ${seconds}s`;
      }
    }

    async function fetchSearchResults() {
      console.log("attempting search");
      try {
          const listingsCol = collection(db, 'listings');
          // Stopword filtering
          let searchQueryArray = removeStopwordsFromString(searchQuery, stopwords)

          /**
           * @type {any[]}
           */
          let allResults = [];
          for (let word of searchQueryArray) {
              let q;
              if (category !== 'Any') {
                  q = query(
                  listingsCol,
                  where('category', '==', category),
                  where(word, 'in', 'searchTerms'),
                  orderBy('searchTerms'),
                  limit(itemsPerPage)
                  );
              } else {
                  q = query(
                  listingsCol,
                  where(word, 'in', 'searchTerms'),
                  orderBy('searchTerms'),
                  limit(itemsPerPage)
                  );
              }
              const querySnapshot = await getDocs(q);
              const docsWithImages = querySnapshot.docs.map(doc => {
                const data = doc.data();
                return { ...data, imageUrl: data.imageURL }; // Access imageURL field directly
              });
              allResults = [...allResults, ...docsWithImages];
          }
          // Remove duplicates
          searchResults = Array.from(new Set(allResults.map(item => JSON.stringify(item)))).map(item => JSON.parse(item));
      } catch (error) {
          console.error('Error fetching search results:', error);
      }
    }


  
    // @ts-ignore
    function handleCategoryChange(event) {
      category = event.target.value;
      fetchSearchResults();
    }
  
    function handleSearch() {
      fetchSearchResults();
    }
  
    // @ts-ignore
    function handlePageChange(page) {
      currentPage = page;
      fetchSearchResults();
    }

    // @ts-ignore
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
      </select> </div>
  
  <!-- Scrollable container for search results -->
  <div class="overflow-auto max-h-60">
    {#if searchResults.length > 0}
      {#each searchResults as result (result.id)}
      <div class="bg-gray-100 p-4 mb-2 rounded-md w-full flex justify-between items-center">
        <div>
          <!-- svelte-ignore a11y-img-redundant-alt -->
          <img src="{result.imageUrl}" class="w-full h-auto rounded-md" alt="Listing image" />
          <p>{result.description}</p>
          {result.title}
        </div>
        <div>
          <p>{calculateTimeLeft(new Date(result.end))}</p> <!-- Calculate and display the time left here -->
        </div>
      </div>
      {/each}
    {:else}
      <p class="text-gray-500">No results found.</p>
    {/if}
  </div>
</div>
 