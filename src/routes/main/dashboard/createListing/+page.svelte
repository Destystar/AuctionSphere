<script>
    let title = '';
    let price = '';
    let selectedCurrency = 'GBP';
  
    // Maximum characters for the title
    const maxTitleCharacters = 30;
  
    // Function to update the title character count
    function updateTitleCount() {
      const remainingCharacters = maxTitleCharacters - title.length;
      console.log(`Remaining characters: ${remainingCharacters}`);
    }
  
    // Function to handle title input and limit length
    // @ts-ignore
    function handleTitleInput(event) {
      title = event.target.value.slice(0, maxTitleCharacters);
      updateTitleCount();
    }
  
    // Function to handle price input
    // @ts-ignore
    function handlePriceInput(event) {
      price = event.target.value.replace(/[^\d.]/g, '');
      const parts = price.split('.');
      if (parts.length > 1) {
        parts[1] = parts[1].slice(0, 2);
        price = parts.join('.');
      }
    }
  
    // Function to handle currency change
    // @ts-ignore
    function handleChange(event) {
      selectedCurrency = event.target.value;
    }
  
    // Function to handle form submission
    function handleSubmit() {
      // Your form submission logic here
    }
  </script>
  
  <div class="max-w-md mt-20 mx-auto p-6 bg-white shadow-md rounded-md">
    <form on:submit={handleSubmit} class="flex flex-col items-center">
      <!-- The title input -->
      <div class="mb-4">
        <!-- svelte-ignore a11y-label-has-associated-control -->
        <label class="block text-gray-700 text-sm font-bold mb-2">
          Title (max {maxTitleCharacters} characters):
        </label>
        <input
          type="text"
          bind:value={title}
          on:input={handleTitleInput}
          class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        />
        <p class="text-sm text-gray-500">Characters remaining: {title.length}/{maxTitleCharacters}</p>
      </div>
      <!-- Price input with Currency dropdown inline -->
      <div class="mb-4 flex items-center">
        <div class="flex items-center w-full">
          <!-- svelte-ignore a11y-label-has-associated-control -->
          <label class="text-gray-700 text-sm font-bold mr-2">
            Price:
          </label>
          <input
            type="text"
            bind:value={price}
            on:input={handlePriceInput}
            class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>
        <select
          id="currency"
          bind:value={selectedCurrency}
          on:change={handleChange}
          class="ml-2 shadow appearance-none border rounded py-2 px-2 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        >
          <option value="GBP">GBP - £</option>
          <option value="EUR">EUR - €</option>
          <option value="USD">USD - $</option>
          <option value="JPY">JPY - ¥</option>
        </select>
      </div>
      <button
        type="submit"
        class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mx-auto"
      >
        Create Listing
      </button>
    </form>
  </div>
  