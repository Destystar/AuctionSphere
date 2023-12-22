<script>
  import { formatPrice } from "../../../../../tools";

  let title = '';
  let image;
  /**
   * @type {number | bigint}
   */
  let price;
  let duration = { days: 0, hours: 0, minutes: 0 };
  let description;
  let selectedCurrency = 'GBP';

  /**
   * @param {{ target: { value: string; }; }} event
   */
  function handleChange(event) {
    selectedCurrency = event.target.value;
  }

  // Maximum characters for the title
  const maxTitleCharacters = 30;

  // Function to update the title character count
  function updateTitleCount() {
    const remainingCharacters = maxTitleCharacters - title.length;
    console.log(`Remaining characters: ${remainingCharacters}`);
  }

  // Function to handle title input and limit length
  function handleTitleInput() {
    // Limit the title length to maxTitleCharacters
    title = title.slice(0, maxTitleCharacters);
    updateTitleCount();
  }

  // Function to handle form submission
  function handleSubmit() {
    // Your form submission logic here
  }
</script>


<div class="max-w-md mx-auto p-6 bg-white shadow-md rounded-md">
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
        <!-- Price label -->
        <!-- svelte-ignore a11y-label-has-associated-control -->
        <label class="text-gray-700 text-sm font-bold mr-2">
          Price:
        </label>
        <!-- Price input -->
        <input
          type="text"
          bind:value={price}
          class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        />
      </div>
      <select
        id="currency"
        bind:value={selectedCurrency}
        class="ml-2 shadow appearance-none border rounded py-2 px-2 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
      >
        <option value="GBP">GBP - £</option>
        <option value="EUR">EUR - €</option>
        <option value="USD">USD - $</option>
      </select>
    </div>
    <p class="text-sm text-gray-500">Formatted Price: {formatPrice(price, selectedCurrency)}</p>
    <button
      type="submit"
      class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mx-auto"
    >
      Create Listing
    </button>
  </form>
</div>
