<script>
    import { authHandlers } from "../store/store";

    let email = "";
    let password = "";
    let confirmPassword = "";
    let error = false;
    let register = false;
    let authenticating = false;

    async function handleAuthenticate() {
        if (authenticating) {
            return;
        }
        if (!email || !password || (register && !confirmPassword)) {
            error = true
            return
        }
        authenticating = true;

        try {

            if (!register) {
                await authHandlers.login(email, password);
            } else {
                await authHandlers.signup(email, password);
            }

        } catch (error) {
            console.log("Auth error occured", error);
            error = true;
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
    <form class="bg-white shadow-md rounded px-8 pt-6 pb-8 flex flex-col gap-y-3 max-w-md w-full">
        <h1 class="text-3xl font-roboto font-bold text-gray-800 mb-4 text-center">{register ? "Register" : "Login"}</h1>
        {#if error}
            <p class="flex justify-center text-red-700 ">Please check the email or password you have entered</p>
        {/if}
            <!-- Email -->
        <div class="flex flex-col">
            <label class="text-gray-700 text-sm font-bold mb-2 flex items-center">
                <span class="w-3/12">Email</span>
                <input bind:value={email} class="shadow appearance-none border rounded py-2 px-2 text-gray-700 leading-tight focus:outline-none focus:shadow-outline flex-1 ml-2" id="email" type="email" placeholder="Enter your email">
            </label>
        </div>
        <!-- Password -->
        <div class="flex flex-col">
            <label class="text-gray-700 text-sm font-bold mb-2 flex items-center">
                <span class="w-3/12">Password</span>
                <input bind:value={password} class="shadow appearance-none border rounded py-2 px-2 text-gray-700 leading-tight focus:outline-none focus:shadow-outline flex-1 ml-2" id="password" type="password" placeholder="Enter your password">
            </label>
        </div>
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
