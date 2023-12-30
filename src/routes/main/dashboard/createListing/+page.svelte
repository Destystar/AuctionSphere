<script>
  // @ts-nocheck
  
      // @ts-ignore
      import { v4 } from 'uuid';
      import { doc, setDoc, collection } from 'firebase/firestore';
      import { auth, db, storage } from "$lib/firebase/firebase";
      import { goto } from '$app/navigation';
      import { removeStopwords, eng } from 'stopword';
      import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
  
      let title = '';
      // @ts-ignore
      let image;
      let description = '';
      let price = '';
      let category = '';
      let selectedCurrency = 'GBP';
      let highestBidderID = '';
      let duration = { days: 0, hours: 0, minutes: 0 };
    
      let submitting = false;
  
      /**
       * @param {{ target: { value: string; }; }} event
       * @param {string | number} unit
       */
      function handleDurationInput(event, unit) {
        let value = parseInt(event.target.value) || 0;
        if (value < 0) {
          value = 0;
        }
        // @ts-ignore
        duration[unit] = value;
      }
    
      const maxTitleCharacters = 30;
      const maxDescriptionCharacters = 300;
  
      const maxLengthPreprocess = 50;
      const stopwords = eng;
  
      function preprocess(str) {
        if (str.length > maxLengthPreprocess) {
          str = str.substring(0, maxLengthPreprocess);
        }
        let words = str.toLowerCase().replace(/[^a-z\s]/gi, '').replace(/\s\s+/g, ' ').split(" ");
        words = removeStopwords(words, stopwords);
        let wordsNoDuplicates = [...new Set(words)];
        if (wordsNoDuplicates.length > 10) {
          wordsNoDuplicates = wordsNoDuplicates.slice(0, 10);
        }
        return wordsNoDuplicates;
      }
  
  
      async function uploadImage(file) {
        if (!file) {
            console.error('No file provided for upload.');
            return;
        }
        let imageID = v4();
        if (/\.(jpe?g|png|gif|webp)$/i.test(file.name)) {
            const storageRef = ref(storage, 'images/' + imageID);
            const uploadTask = uploadBytesResumable(storageRef, file);
  
            return new Promise((resolve, reject) => {
                uploadTask.on('state_changed',
                    (snapshot) => {
                        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                        console.log('Upload is ' + progress + '% done');
                    },
                    (error) => {
                        console.log("error:-", error)
                        reject(error);
                    },
                    () => {
                        getDownloadURL(uploadTask.snapshot.ref).then(resolve);
                    }
                );
            });
        } else {
            alert('Please upload a valid image file.');
        }
      }
  
  
      /**
      * @param {{ target: { files: any[]; }; }} event
      */
      function handleImageUpload(event) {
          const file = event.target.files[0];
          if (file && /\.(jpe?g|png|gif|webp)$/i.test(file.name)) {
              const reader = new FileReader();
              reader.onload = () => {
              image = reader.result;
              };
              reader.readAsDataURL(file);
          } else {
              alert('Please upload a valid image file.');
          }
      }
  
      function updateTitleCount() {
        const remainingCharacters = maxTitleCharacters - title.length;
        console.log(`Remaining characters: ${remainingCharacters}`);
      }
  
      function updateDescriptionCount() {
        const remainingCharacters = maxDescriptionCharacters - title.length;
        console.log(`Remaining characters: ${remainingCharacters}`);
      }
  
      // @ts-ignore
      function handleDescriptionInput(event) {
        description = event.target.value.slice(0, maxDescriptionCharacters);
        updateDescriptionCount();
      }
    
      // @ts-ignore
      function handleTitleInput(event) {
        title = event.target.value.slice(0, maxTitleCharacters);
        updateTitleCount();
      }
    
      // @ts-ignore
      function handlePriceInput(event) {
        price = event.target.value.replace(/[^\d.]/g, '');
        const parts = price.split('.');
        if (parts.length > 1) {
          parts[1] = parts[1].slice(0, 2);
          price = parts.join('.');
        }
      }
    
      // @ts-ignore
      function handleCurrencyChange(event) {
        selectedCurrency = event.target.value;
      }
  
      function handleCategoryChange(event){
        category = event.target.value;
      }
  
      // Function to calculate the end time
      function calculateEnd() {
          const currentDateTime = new Date();
          const totalMilliseconds = duration.days * 24 * 60 * 60 * 1000 + duration.hours * 60 * 60 * 1000 + duration.minutes * 60 * 1000;
          const endDateTime = new Date(currentDateTime.getTime() + totalMilliseconds);
          return endDateTime;
      }
  
    
      // Function to handle form submission
      async function handleSubmit() {
        submitting = true;
        try {
            const user = auth.currentUser;
            if (!user) {
                console.error("You are not signed in");
                return;
            }
            let searchTerms = title + " " + description;
            const listingsCol = collection(db, 'listings');
            const listingID = v4();
            // The data to be saved in database
            const listingData = {
                listingID,
                sellerID: user.uid,
                title,
                imageURL: await uploadImage(document.getElementById('imageInput').files[0]),
                price,
                currency: selectedCurrency,
                end: calculateEnd(),
                description,
                searchTerms: preprocess(searchTerms),
                highestBidderID,
            };
            const listingDocRef = doc(listingsCol, listingID);
            await setDoc(listingDocRef, listingData);
            goto('../dashboard');
        } catch (error) {
            console.error("Error during form submission", error);
        }
        submitting = false;
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
        <input type="text" bind:value={title} on:input={handleTitleInput} class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"/>
        <p class="text-sm text-gray-500">Characters remaining: {title.length}/{maxTitleCharacters}</p>
      </div>
      <!-- Image upload -->
      <div class="mb-6 flex flex-col items-center">
        <!-- svelte-ignore a11y-label-has-associated-control -->
        <label class="block text-gray-700 text-sm font-bold mb-2">
          Upload Image:
        </label>
        <div class="relative">
          <input type="file" accept="image/*" on:change={handleImageUpload} class="hidden" id="imageInput" />
          <label for="imageInput" class="cursor-pointer inline-block w-full h-40 border border-dashed border-gray-300 rounded-md flex items-center justify-center bg-gray-100 hover:bg-gray-200 focus:outline-none focus:shadow-outline">
            {#if image}
              <img src={image} alt="Uploaded" class="w-full h-full object-cover" />
            {:else}
              <span class="text-gray-500">Click or drag to upload an image</span>
            {/if}
          </label>
        </div>
      </div>
      <!-- Category selection -->
      <div class="mb-4 flex items-center w-full">
        <div class="flex items-center">
          <!-- svelte-ignore a11y-label-has-associated-control -->
          <label class="text-gray-700 text-sm font-bold mr-[0.6rem] ml-[-0.5rem]">
            Category:
          </label>
        </div>
        <select id="category" bind:value={category} on:change={handleCategoryChange} class="w-full shadow appearance-none border rounded py-2 px-2 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mr-[1.15rem]">
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
      </div>
          
      <!-- Price input with currency selection -->
      <div class="mb-4 flex items-center">
        <div class="flex items-center w-full">
          <!-- svelte-ignore a11y-label-has-associated-control -->
          <label class="text-gray-700 text-sm font-bold mr-2">
            Price:
          </label>
          <input type="text" bind:value={price} on:input={handlePriceInput} class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"/>
        </div>
        <select id="currency" bind:value={selectedCurrency} on:change={handleCurrencyChange} class="ml-2 shadow appearance-none border rounded py-2 px-2 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
          <option value="GBP">GBP - £</option>
          <option value="EUR">EUR - €</option>
          <option value="USD">USD - $</option>
          <option value="JPY">JPY - ¥</option>
        </select>
      </div>
      <!-- Duration input -->
      <div class="mb-4 flex items-center">
        <!-- Duration input for days -->
        <div class="mr-4">
          <!-- svelte-ignore a11y-label-has-associated-control -->
          <label class="block text-gray-700 text-sm font-bold mb-2">
            Days:
          </label>
          <input type="number" bind:value={duration.days} on:input={(event) => handleDurationInput(event, 'days')} class="shadow appearance-none border rounded w-16 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"/>
        </div>
  
        <!-- Duration input for hours -->
        <div class="mr-4">
          <!-- svelte-ignore a11y-label-has-associated-control -->
          <label class="block text-gray-700 text-sm font-bold mb-2">
            Hours:
          </label>
          <input
            type="number"
            bind:value={duration.hours}
            on:input={(event) => {
              const value = parseInt(event.target.value) || 0;
              const totalHours = value + duration.days * 24;
              duration.hours = totalHours % 24;
              duration.days = Math.floor(totalHours / 24);
            }}
            class="shadow appearance-none border rounded w-16 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"/>
        </div>
  
        <!-- Duration input for minutes -->
        <div>
          <!-- svelte-ignore a11y-label-has-associated-control -->
          <label class="block text-gray-700 text-sm font-bold mb-2">
            Minutes:
          </label>
          <input
            type="number"
            bind:value={duration.minutes}
            on:input={(event) => {
              const value = parseInt(event.target.value) || 0;
              const totalMinutes = value + duration.hours * 60 + duration.days * 24 * 60;
              duration.minutes = totalMinutes % 60;
              duration.hours = Math.floor(totalMinutes / 60) % 24;
              duration.days = Math.floor(totalMinutes / (24 * 60));
            }}
            class="shadow appearance-none border rounded w-16 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>
      </div>
      <!-- The description -->
      <div class="mb-4">
        <!-- svelte-ignore a11y-label-has-associated-control -->
        <label class="block text-gray-700 text-sm font-bold mb-2">
          Description (max {maxDescriptionCharacters} characters):
        </label>
        <input type="text" bind:value={description} on:input={handleDescriptionInput} class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"/>
        <p class="text-sm text-gray-500">Characters remaining: {description.length}/{maxDescriptionCharacters}</p>
      </div>
      <button
        type="submit"
        class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mx-auto">
        {#if submitting}
          <i class="fas fa-spinner fa-pulse"></i>
        {:else}
          Create Listing
        {/if}
      </button>
    </form>
  </div>
  