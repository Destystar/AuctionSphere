<script>
    import { onMount } from 'svelte';
    import { collection, query, where, orderBy, limit, getDocs } from "firebase/firestore";
    import { db } from "$lib/firebase/firebase";
  
    let searchQuery = '';
    /**
     * @type {string | any[]}
     */
    let searchResults = [];
    const itemsPerPage = 10;
    let currentPage = 1;
    let category = "Any";
  
    const stopWords = ['a', 'an', 'and', 'the', 'in', 'of', 'with', 'for', 'on', 'at', 'by', 'to', 'from', 'as', 'is', 'are', 'was', 'were', 'it', 'that', 'this', 'these', 'those', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did'];
  
    async function fetchSearchResults() {
        console.log("attempting search");
        try {
            const listingsCol = collection(db, 'listings');
            // Stopword filtering
            const words = searchQuery.split(' ');
            const filteredWords = words.filter(word => !stopWords.includes(word));
            const filteredQuery = filteredWords.join(' ');

            let q;
            if (category !== 'Any') {
                q = query(
                listingsCol,
                where('category', '==', category),
                where('searchTerms', '>=', filteredQuery),
                orderBy('searchTerms'),
                limit(itemsPerPage)
                );
            } else {
                q = query(
                listingsCol,
                where('searchTerms', '>=', filteredQuery),
                orderBy('searchTerms'),
                limit(itemsPerPage)
                );
            }

            const querySnapshot = await getDocs(q);
            searchResults = querySnapshot.docs.map(doc => doc.data());
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
        <!-- Render each search result item in a small box -->
        <div class="bg-gray-100 p-4 mb-2 rounded-md w-full">{result.title}</div>
      {/each}
      <!-- Pagination -->
      <div class="mt-4 flex items-center justify-center">
        {#each Array(Math.ceil(searchResults.length / itemsPerPage)).map((_, index) => index + 1) as page}
          <button on:click={() => handlePageChange(page)} class="bg-blue-500 text-white p-2 rounded-md ml-2">{page}</button>
        {/each}
      </div>
    {:else}
      <p class="text-gray-500">No results found.</p>
    {/if}
  </div>
  </div>
 