<script>
    import { auth, db } from "$lib/firebase/firebase";
    import { authHandlers } from "../store/store";
    import CryptoJS from "crypto-js";
    import { updateProfile, onAuthStateChanged } from "firebase/auth";
    import { doc, setDoc, collection, getDocs, query, where } from "firebase/firestore";

    // input variables 
    let email = "";
    let password = "";
    let confirmPassword = "";
    let displayName = "";

    // error variables 
    let errorAuth = false;
    let errorLack = false;
    let errorMatch = false;
    let errorValid = false;

    // status variables 
    let register = false;
    let authenticating = false;

    // password validation variables 
    let isLengthValid = false;
    let isLowercaseValid = false;
    let isUppercaseValid = false;
    let isNumberValid = false;
    let isSpecialCharacterValid = false;

    /**
     * @param {any} input
     * @param {any} key
     */
    function encrypt(input, key) {
        return CryptoJS.AES.encrypt(input, key).toString();
    }

    // @ts-ignore
    function handlePasswordInput(event) {
        const value = event.target.value;
        updateRequirement('length', value.length >= 8);
        updateRequirement('lowercase', /[a-z]/.test(value));
        updateRequirement('uppercase', /[A-Z]/.test(value));
        updateRequirement('number', /\d/.test(value));
        updateRequirement('characters', /[^\w\d]/.test(value));
    }

    // @ts-ignore
    function updateRequirement(id, isValid) {
        if (id === 'length') {
            isLengthValid = isValid;
        } else if (id === 'lowercase') {
            isLowercaseValid = isValid;
        } else if (id === 'uppercase') {
            isUppercaseValid = isValid;
        } else if (id === 'number') {
            isNumberValid = isValid;
        } else if (id === 'characters') {
            isSpecialCharacterValid = isValid;
        }
    }

    function checkValid() {
        return isLengthValid && isLowercaseValid && isUppercaseValid && isNumberValid && isSpecialCharacterValid;
    }

    async function handleAuthenticate() {
    if (authenticating) {
        return;
    }

    if (!email || !password || (register && (!displayName || !confirmPassword))) {
        errorAuth = true;
        errorLack = true;
        return;
    }

    authenticating = true;
    errorAuth = false;
    errorLack = false;
    errorMatch = false;
    errorValid = false;

    try {
        if (!register) {
            if (password !== "" || email !== "") {
                await authHandlers.login(email, password);
            } else {
                errorAuth = true;
                errorLack = true;
            }
        } else {
            await authHandlers.signup(email, password);
            const unsubscribe = onAuthStateChanged(auth, async (user) => {
                if (user) {
                    // Use updateProfile to add the username
                    await updateProfile(user, { displayName: displayName });

                    // Wait for a short time to allow updateProfile to take effect
                    await new Promise(resolve => setTimeout(resolve, 1000));

                    // Check if the username is already taken
                    const usernameQuerySnapshot = await getDocs(query(collection(db, 'user'), where('username', '==', displayName)));
                    if (!usernameQuerySnapshot.empty) {
                        errorAuth = true;
                        errorValid = false;
                        errorMatch = false;
                        errorLack = false;
                        alert('Username is already taken. Please choose another.');
                        return;
                    }

                    // Assuming your collection is named 'user' (singular)
                    await setDoc(doc(db, 'user', user.uid), {
                        username: displayName,
                    }, { merge: true });
                } else {
                    console.error("User not found after signup");
                }

                // Unsubscribe from the listener
                unsubscribe();
            });
        }
    } catch (error) {
        console.log("Auth error occurred", error);
        errorAuth = true;
    } finally {
        authenticating = false;
    }
}


    function handleRegister() {
        register = !register;
    }
</script>

<div class="h-screen flex items-center justify-center">
    <!-- Main Login Container -->
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <form class="bg-ghost shadow-md rounded px-8 pt-6 pb-8 flex flex-col gap-y-3 max-w-md w-full">
        <h1 class="text-3xl font-roboto font-bold text-gray-800 mb-4 text-center">{register ? "Register" : "Login"}</h1>
        <!-- displays errors-->
        {#if errorAuth}
            {#if errorMatch}
                <p class="flex justify-center text-red-700 ">Your passwords don't match</p>
            {:else if errorValid}
                <p class="flex justify-center text-red-700 ">Your password doesn't meet the minimum requirements</p>
            {:else}
                <p class="flex justify-center text-red-700 ">{ errorLack ? "You haven't entered all of the required information" : "Please check the email or password you have entered" }</p>
            {/if}
        {/if}
            <!-- Email -->
        <div class="flex flex-col">
            <label class="text-gray-700 text-sm font-bold mb-2 flex items-center">
                <span class="w-3/12">Email</span>
                <input bind:value={email} class="shadow appearance-none border rounded py-2 px-2 text-gray-700 leading-tight focus:outline-none focus:shadow-outline flex-1 ml-2" id="email" type="email" placeholder="Enter your email">
            </label>
        </div>
        <!-- Display Name -->
        {#if register}
        <div class="flex flex-col">
            <label class="text-gray-700 text-sm font-bold mb-2 flex items-center">
                <span class="w-3/12">Display Name</span>
                <input bind:value={displayName} class="shadow appearance-none border rounded py-2 px-2 text-gray-700 leading-tight focus:outline-none focus:shadow-outline flex-1 ml-2" id="text" type="text" placeholder="Enter your username">
            </label>
        </div>
        {/if}
        <!-- Password -->
        <div class="flex flex-col">
            <label class="text-gray-700 text-sm font-bold mb-2 flex items-center">
                <span class="w-3/12">Password</span>
                <input bind:value={password} on:input={handlePasswordInput} class="shadow appearance-none border rounded py-2 px-2 text-gray-700 leading-tight focus:outline-none focus:shadow-outline flex-1 ml-2" id="password" type="password" placeholder="Enter your password">
            </label>
        </div>
        <!-- password requirements check -->
        {#if register}
        <div class="flex flex-wrap items-center">
            <p class="text-sm flex-1 min-w-max my-2 mx-0 {isLengthValid ? 'text-green-500' : 'text-red-500'}" id="length">
                <span class="inline-block w-4 h-4 mr-1.5 rounded-full {isLengthValid ? 'bg-green-500' : 'bg-red-500'}"></span>
                Min. 8 characters
            </p>
            <p class="text-sm flex-1 min-w-max my-2 mx-0 {isLowercaseValid ? 'text-green-500' : 'text-red-500'}" id="lowercase">
                <span class="inline-block w-4 h-4 mr-1.5 rounded-full {isLowercaseValid ? 'bg-green-500' : 'bg-red-500'}"></span>
                Include lowercase letter
            </p>
            <p class="text-sm flex-1 min-w-max my-2 mx-0 {isUppercaseValid ? 'text-green-500' : 'text-red-500'}" id="uppercase">
                <span class="inline-block w-4 h-4 mr-1.5 rounded-full {isUppercaseValid ? 'bg-green-500' : 'bg-red-500'}"></span>
                Include uppercase letter
            </p>
            <p class="text-sm flex-1 min-w-max my-2 mx-0 {isNumberValid ? 'text-green-500' : 'text-red-500'}" id="number">
                <span class="inline-block w-4 h-4 mr-1.5 rounded-full {isNumberValid ? 'bg-green-500' : 'bg-red-500'}"></span>
                Include number
            </p>
            <p class="text-sm flex-1 min-w-max my-2 mx-0 {isSpecialCharacterValid ? 'text-green-500' : 'text-red-500'}" id="characters">
                <span class="inline-block w-4 h-4 mr-1.5 rounded-full {isSpecialCharacterValid ? 'bg-green-500' : 'bg-red-500'}"></span>
                Include a special character
            </p>
        </div>        
        {/if}
        <!-- Confirm Password -->
        {#if register}
            <div class="flex flex-col">
                <label class="text-gray-700 text-sm font-bold mb-2 flex items-center">
                    <span class="w-3/12">Confirm Password</span>
                    <input bind:value={confirmPassword} class="shadow appearance-none border rounded py-2 px-2 text-gray-700 leading-tight focus:outline-none focus:shadow-outline flex-1 ml-2" id="password" type="password" placeholder="Confirm password">
                </label>
            </div>
        {/if}

        <!-- Buttons -->
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <div on:click={handleAuthenticate} class="flex items-center justify-center">
            <button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" type="submit">
                {#if authenticating}
                <i class="fas fa-spinner fa-pulse"></i>
                {:else}
                    {register ? "Create Account" : "Login"}
                {/if}
            </button>
        </div>

        <!-- "Or" section -->
        <div class="options flex justify-center items-center flex-col p-6">
            <p>Or</p>
            {#if !register}
                <div class="flex items-center flex-col">
                    <!-- svelte-ignore a11y-click-events-have-key-events -->
                    <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
                    <p on:click={handleRegister} class="hover:text-custom-slate cursor-pointer">Don't have an account?</p>
                </div>
            {:else}
                <div>
                    <!-- svelte-ignore a11y-click-events-have-key-events -->
                    <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
                    <p on:click={handleRegister} class="hover:text-custom-slate cursor-pointer">Already have an account?</p>
                </div>
            {/if}
        </div>
    </form>
</div>
